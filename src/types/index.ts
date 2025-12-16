// Volunteer session stored in localStorage
export interface VolunteerSession {
  volunteerName: string;
  sessionStarted: string;
}

// Child info for toy distribution
export type ChildGender = 'boy' | 'girl';

export interface ChildInfo {
  age: number;
  gender: ChildGender;
}

// Ticket data model (for future use)
export interface Ticket {
  id: string;
  recipientName: string;
  phoneNumber: string;
  email: string;
  adultCount: number;
  childCount: number;
  children?: ChildInfo[];
  groupSize: number;
  specialNeeds?: string;
  rsvpStatus: 'confirmed' | 'declined';
  status: 'issued' | 'checked-in';
  createdAt: string;
  createdBy: string;
}

// Check-in data model (for future use)
export interface CheckIn {
  ticketId: string;
  checkedInAt: string;
  checkedInBy: string;
  actualAdults: number;
  actualChildren: number;
  actualTotal: number;
}

// Walk-in data model (for future use)
export interface WalkIn {
  id: string;
  name: string;
  phoneNumber: string;
  adultCount: number;
  childCount: number;
  children?: ChildInfo[];
  totalCount: number;
  checkedInAt: string;
  checkedInBy: string;
}

// Activity item for history view (for future use)
export interface ActivityItem {
  id: string;
  type: 'ticket' | 'checkin' | 'walkin';
  name: string;
  count: number;
  timestamp: string;
  volunteerName: string;
}
