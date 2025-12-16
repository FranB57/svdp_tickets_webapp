import type { Ticket, CheckIn, WalkIn } from '../types';
import { syncTicket, syncCheckIn, syncWalkIn } from './googleSheets';

const TICKETS_KEY = 'svdp_tickets';
const CHECKINS_KEY = 'svdp_checkins';
const WALKINS_KEY = 'svdp_walkins';

// Ticket Storage Functions

export function getTickets(): Ticket[] {
  const data = localStorage.getItem(TICKETS_KEY);
  const tickets = data ? JSON.parse(data) : [];
  console.log('[TicketStorage] getTickets:', tickets.length, 'tickets');
  return tickets;
}

export function saveTicket(ticket: Ticket, skipSync = false): void {
  const tickets = getTickets();
  const existingIndex = tickets.findIndex((t) => t.id === ticket.id);
  const isUpdate = existingIndex >= 0;

  if (isUpdate) {
    tickets[existingIndex] = ticket;
    console.log('[TicketStorage] Updated ticket:', ticket.id);
  } else {
    tickets.push(ticket);
    console.log('[TicketStorage] Saved new ticket:', ticket.id, ticket.recipientName);
  }

  localStorage.setItem(TICKETS_KEY, JSON.stringify(tickets));
  console.log('[TicketStorage] Total tickets now:', tickets.length);

  // Sync to Google Sheets (fire and forget)
  if (!skipSync) {
    syncTicket(ticket, isUpdate ? 'update' : 'create').catch((err) => {
      console.warn('[TicketStorage] Sheets sync failed:', err);
    });
  }
}

export function getTicketById(id: string): Ticket | undefined {
  const tickets = getTickets();
  const ticket = tickets.find((t) => t.id.toUpperCase() === id.toUpperCase());
  console.log('[TicketStorage] getTicketById:', id, ticket ? 'FOUND' : 'NOT FOUND');
  return ticket;
}

export function searchTickets(query: string): Ticket[] {
  const tickets = getTickets();
  const normalizedQuery = query.toLowerCase().trim();

  if (!normalizedQuery) return [];

  return tickets.filter((ticket) => {
    const nameMatch = ticket.recipientName.toLowerCase().includes(normalizedQuery);
    const phoneMatch = ticket.phoneNumber.replace(/\D/g, '').includes(normalizedQuery.replace(/\D/g, ''));
    const idMatch = ticket.id.toLowerCase().includes(normalizedQuery);
    return nameMatch || phoneMatch || idMatch;
  });
}

// Check-in Storage Functions

export function getCheckIns(): CheckIn[] {
  const data = localStorage.getItem(CHECKINS_KEY);
  return data ? JSON.parse(data) : [];
}

export function getCheckInByTicketId(ticketId: string): CheckIn | undefined {
  const checkIns = getCheckIns();
  return checkIns.find((c) => c.ticketId.toUpperCase() === ticketId.toUpperCase());
}

export function isTicketCheckedIn(ticketId: string): boolean {
  return getCheckInByTicketId(ticketId) !== undefined;
}

export function saveCheckIn(checkIn: CheckIn): void {
  const checkIns = getCheckIns();
  checkIns.push(checkIn);
  localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns));

  // Also update ticket status
  const ticket = getTicketById(checkIn.ticketId);
  if (ticket) {
    ticket.status = 'checked-in';
    saveTicket(ticket, true); // Skip sync, we'll sync the check-in instead
  }

  // Sync check-in to Google Sheets (fire and forget)
  syncCheckIn(checkIn, ticket).catch((err) => {
    console.warn('[TicketStorage] Sheets sync failed for check-in:', err);
  });
}

// Parse QR payload
export interface QRPayload {
  id: string;
  n: string;
  g: number;
  v: number;
}

export function parseQRPayload(data: string): QRPayload | null {
  try {
    const payload = JSON.parse(data);
    if (payload.id && typeof payload.g === 'number' && payload.v) {
      return payload as QRPayload;
    }
    return null;
  } catch {
    return null;
  }
}

// Walk-in Storage Functions

export function getWalkIns(): WalkIn[] {
  const data = localStorage.getItem(WALKINS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveWalkIn(walkIn: WalkIn): void {
  const walkIns = getWalkIns();
  walkIns.push(walkIn);
  localStorage.setItem(WALKINS_KEY, JSON.stringify(walkIns));
  console.log('[TicketStorage] Saved walk-in:', walkIn.id, walkIn.name);

  // Sync walk-in to Google Sheets (fire and forget)
  syncWalkIn(walkIn).catch((err) => {
    console.warn('[TicketStorage] Sheets sync failed for walk-in:', err);
  });
}

// Generate unique ID for walk-ins
export function generateWalkInId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'W';
  for (let i = 0; i < 7; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Statistics
export function getStats(): {
  totalTickets: number;
  checkedIn: number;
  walkIns: number;
  totalExpectedGuests: number;
  totalActualGuests: number;
  totalWalkInGuests: number;
} {
  const tickets = getTickets();
  const checkIns = getCheckIns();
  const walkIns = getWalkIns();

  return {
    totalTickets: tickets.length,
    checkedIn: checkIns.length,
    walkIns: walkIns.length,
    totalExpectedGuests: tickets.reduce((sum, t) => sum + t.groupSize, 0),
    totalActualGuests: checkIns.reduce((sum, c) => sum + c.actualTotal, 0),
    totalWalkInGuests: walkIns.reduce((sum, w) => sum + w.totalCount, 0),
  };
}

// Activity History
export interface ActivityItem {
  id: string;
  type: 'ticket' | 'checkin' | 'walkin';
  name: string;
  count: number;
  timestamp: string;
  volunteerName: string;
}

export function getActivityHistory(volunteerName?: string): ActivityItem[] {
  const tickets = getTickets();
  const checkIns = getCheckIns();
  const walkIns = getWalkIns();

  const activities: ActivityItem[] = [];

  // Add tickets
  tickets.forEach((ticket) => {
    if (!volunteerName || ticket.createdBy === volunteerName) {
      activities.push({
        id: ticket.id,
        type: 'ticket',
        name: ticket.recipientName,
        count: ticket.groupSize,
        timestamp: ticket.createdAt,
        volunteerName: ticket.createdBy,
      });
    }
  });

  // Add check-ins
  checkIns.forEach((checkIn) => {
    if (!volunteerName || checkIn.checkedInBy === volunteerName) {
      const ticket = getTicketById(checkIn.ticketId);
      activities.push({
        id: checkIn.ticketId,
        type: 'checkin',
        name: ticket?.recipientName || 'Unknown',
        count: checkIn.actualTotal,
        timestamp: checkIn.checkedInAt,
        volunteerName: checkIn.checkedInBy,
      });
    }
  });

  // Add walk-ins
  walkIns.forEach((walkIn) => {
    if (!volunteerName || walkIn.checkedInBy === volunteerName) {
      activities.push({
        id: walkIn.id,
        type: 'walkin',
        name: walkIn.name,
        count: walkIn.totalCount,
        timestamp: walkIn.checkedInAt,
        volunteerName: walkIn.checkedInBy,
      });
    }
  });

  // Sort by timestamp (most recent first)
  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return activities;
}
