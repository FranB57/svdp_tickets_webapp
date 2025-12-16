import type { Ticket, CheckIn, WalkIn } from '../types';

const SHEETS_URL = import.meta.env.VITE_GOOGLE_SHEETS_URL;

// Queue for offline support
const SYNC_QUEUE_KEY = 'svdp_sync_queue';

interface SyncQueueItem {
  id: string;
  type: 'ticket' | 'checkin' | 'walkin';
  action: 'create' | 'update';
  data: Ticket | CheckIn | WalkIn;
  timestamp: string;
  retries: number;
}

// Check if Google Sheets is configured
export function isSheetsConfigured(): boolean {
  return !!SHEETS_URL;
}

// Get pending sync items
export function getSyncQueue(): SyncQueueItem[] {
  const data = localStorage.getItem(SYNC_QUEUE_KEY);
  return data ? JSON.parse(data) : [];
}

// Save sync queue
function saveSyncQueue(queue: SyncQueueItem[]): void {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

// Add item to sync queue
function addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>): void {
  const queue = getSyncQueue();
  queue.push({
    ...item,
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    retries: 0,
  });
  saveSyncQueue(queue);
}

// Remove item from sync queue
function removeFromSyncQueue(id: string): void {
  const queue = getSyncQueue();
  saveSyncQueue(queue.filter((item) => item.id !== id));
}

// Format children data for sheets
function formatChildren(children?: { age: number; gender: string }[]): string {
  if (!children || children.length === 0) return '';
  return children.map((c, i) => `Child ${i + 1}: ${c.age}yrs, ${c.gender}`).join('; ');
}

// Send data to Google Sheets
async function sendToSheets(
  sheetName: string,
  action: 'create' | 'update',
  data: Record<string, unknown>
): Promise<boolean> {
  if (!SHEETS_URL) {
    console.log('[GoogleSheets] Not configured, skipping sync');
    return false;
  }

  try {
    await fetch(SHEETS_URL, {
      method: 'POST',
      mode: 'no-cors', // Apps Script requires this
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sheet: sheetName,
        action,
        data,
      }),
    });

    // With no-cors, we can't read the response, but if no error thrown, assume success
    console.log(`[GoogleSheets] Sent ${action} to ${sheetName}`);
    return true;
  } catch (error) {
    console.error('[GoogleSheets] Error sending data:', error);
    return false;
  }
}

// Sync a ticket to Google Sheets
export async function syncTicket(ticket: Ticket, action: 'create' | 'update' = 'create'): Promise<boolean> {
  const data = {
    id: ticket.id,
    recipientName: ticket.recipientName,
    phoneNumber: ticket.phoneNumber,
    email: ticket.email,
    adultCount: ticket.adultCount,
    childCount: ticket.childCount,
    children: formatChildren(ticket.children),
    groupSize: ticket.groupSize,
    specialNeeds: ticket.specialNeeds || '',
    rsvpStatus: ticket.rsvpStatus,
    status: ticket.status,
    createdAt: ticket.createdAt,
    createdBy: ticket.createdBy,
  };

  const success = await sendToSheets('Tickets', action, data);

  if (!success) {
    addToSyncQueue({ type: 'ticket', action, data: ticket });
  }

  return success;
}

// Sync a check-in to Google Sheets
export async function syncCheckIn(checkIn: CheckIn, ticket?: Ticket): Promise<boolean> {
  const data = {
    ticketId: checkIn.ticketId,
    recipientName: ticket?.recipientName || '',
    checkedInAt: checkIn.checkedInAt,
    checkedInBy: checkIn.checkedInBy,
    expectedAdults: ticket?.adultCount || 0,
    expectedChildren: ticket?.childCount || 0,
    expectedTotal: ticket?.groupSize || 0,
    actualAdults: checkIn.actualAdults,
    actualChildren: checkIn.actualChildren,
    actualTotal: checkIn.actualTotal,
    children: ticket ? formatChildren(ticket.children) : '',
  };

  const success = await sendToSheets('CheckIns', 'create', data);

  if (!success) {
    addToSyncQueue({ type: 'checkin', action: 'create', data: checkIn });
  }

  return success;
}

// Sync a walk-in to Google Sheets
export async function syncWalkIn(walkIn: WalkIn): Promise<boolean> {
  const data = {
    id: walkIn.id,
    name: walkIn.name,
    phoneNumber: walkIn.phoneNumber,
    adultCount: walkIn.adultCount,
    childCount: walkIn.childCount,
    children: formatChildren(walkIn.children),
    totalCount: walkIn.totalCount,
    checkedInAt: walkIn.checkedInAt,
    checkedInBy: walkIn.checkedInBy,
  };

  const success = await sendToSheets('WalkIns', 'create', data);

  if (!success) {
    addToSyncQueue({ type: 'walkin', action: 'create', data: walkIn });
  }

  return success;
}

// Process sync queue (retry failed items)
export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  const queue = getSyncQueue();
  let success = 0;
  let failed = 0;

  for (const item of queue) {
    let synced = false;

    if (item.type === 'ticket') {
      synced = await syncTicket(item.data as Ticket, item.action);
    } else if (item.type === 'checkin') {
      synced = await syncCheckIn(item.data as CheckIn);
    } else if (item.type === 'walkin') {
      synced = await syncWalkIn(item.data as WalkIn);
    }

    if (synced) {
      removeFromSyncQueue(item.id);
      success++;
    } else {
      // Update retry count
      const updatedQueue = getSyncQueue();
      const idx = updatedQueue.findIndex((q) => q.id === item.id);
      if (idx >= 0) {
        updatedQueue[idx].retries++;
        // Remove if too many retries
        if (updatedQueue[idx].retries > 5) {
          updatedQueue.splice(idx, 1);
          failed++;
        }
        saveSyncQueue(updatedQueue);
      }
    }
  }

  return { success, failed };
}

// Get sync status
export function getSyncStatus(): { pending: number; configured: boolean } {
  return {
    pending: getSyncQueue().length,
    configured: isSheetsConfigured(),
  };
}
