# SVDP Event Tracker

A web application for SVDP (St. Vincent de Paul) Guadalupe Conference to manage ticket issuance and attendance tracking for their annual Christmas breakfast and toy giveaway event.

## Project Overview

This app enables volunteers to:
- Issue digital tickets to families who RSVP for the event
- Scan QR codes at check-in to track attendance
- Register walk-in guests without tickets
- View activity history

**Target Users:** 15-20 volunteers, ~100 expected attendees
**Key Constraint:** Non-technical users, must be simple and intuitive

## Tech Stack

- **Framework:** Vite + React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Routing:** React Router DOM
- **State:** React Context (AuthContext)
- **Storage:** localStorage (session persistence)
- **i18n:** Bilingual (Spanish/English) - dual display approach

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_VOLUNTEER_PIN=1234
VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

- **VITE_VOLUNTEER_PIN:** Shared PIN for all volunteers
- **VITE_GOOGLE_SHEETS_URL:** (Optional) Google Apps Script web app URL for syncing data

## Google Sheets Integration

The app can sync all data (tickets, check-ins, walk-ins) to Google Sheets in real-time.

### Setup Instructions

1. Create a new Google Sheet
2. Create three sheets (tabs) named exactly: `Tickets`, `CheckIns`, `WalkIns`
3. Go to **Extensions > Apps Script**
4. Delete any existing code and paste the contents of `google-apps-script.js`
5. In Apps Script, click **Run > setupHeaders** to add column headers
6. Click **Deploy > New deployment**
7. Select type: **Web app**
8. Set "Execute as": **Me**
9. Set "Who has access": **Anyone**
10. Click **Deploy** and authorize when prompted
11. Copy the Web app URL and add it to your `.env` file as `VITE_GOOGLE_SHEETS_URL`

### Features

- **Real-time sync:** Data syncs immediately when tickets are created or guests check in
- **Offline queue:** If sync fails, items are queued and retried automatically
- **Status indicator:** Green dot in header = connected, yellow pulsing = pending sync
- **Children details:** Age and gender info for each child is included for toy distribution

## Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── Button.tsx         # Primary button component
│   │   ├── Input.tsx          # Text input with label/error
│   │   └── PinInput.tsx       # 4-digit PIN input
│   └── layout/
│       └── Header.tsx         # App header with user info
├── pages/
│   ├── AuthPage.tsx           # Volunteer login (name + PIN)
│   ├── HomePage.tsx           # Main dashboard with actions
│   ├── IssuePage.tsx          # Ticket creation (stub)
│   ├── ScanPage.tsx           # QR scanner (stub)
│   ├── WalkInPage.tsx         # Walk-in registration (stub)
│   └── HistoryPage.tsx        # Activity history (stub)
├── contexts/
│   └── AuthContext.tsx        # Volunteer session management
├── hooks/
│   └── useAuth.ts             # Auth hook
├── types/
│   └── index.ts               # TypeScript interfaces
├── i18n/
│   └── labels.ts              # EN/ES bilingual labels
├── App.tsx                    # Router setup with auth guards
└── main.tsx                   # App entry point
```

## Authentication Flow

1. User enters name and 4-digit PIN on `/login`
2. PIN validated against `VITE_VOLUNTEER_PIN` env variable
3. Session stored in localStorage (name + session start time)
4. Protected routes redirect to `/login` if no session
5. "Switch User" button in header clears session

## Bilingual Labels

All UI text uses the dual-display approach:
```typescript
// Shows: "Nombre / Name"
label('name')
```

Labels are defined in `src/i18n/labels.ts`.

## Implementation Status

### Completed
- [x] Project setup (Vite + React + TypeScript + Tailwind)
- [x] Volunteer authentication (name + PIN)
- [x] Session persistence (localStorage)
- [x] Home page with navigation
- [x] Bilingual labels
- [x] Basic routing structure

### TODO - Phase 2: Ticket Issuance
- [x] Ticket creation form
- [x] QR code generation
- [x] PDF ticket generation
- [x] Google Sheets integration
- [x] Children details (age/gender for toy distribution)

### TODO - Phase 3: QR Scanner
- [ ] Camera access
- [ ] QR code scanning (html5-qrcode)
- [ ] Check-in flow with count modification
- [ ] Duplicate check-in prevention

### TODO - Phase 4: Walk-in Registration
- [ ] Walk-in form
- [ ] Separate tracking from ticketed guests

### TODO - Phase 5: Additional Features
- [ ] Offline support (queue actions locally)
- [ ] Activity history view
- [ ] Statistics dashboard

## Key Design Decisions

1. **Shared PIN:** All volunteers use the same PIN for simplicity
2. **No server auth:** PIN validation is client-side only
3. **Dual language:** Show both Spanish and English on all labels
4. **Mobile-first:** Designed for use on phones during event
5. **localStorage:** Session and offline data stored locally

## Data Models

```typescript
// Volunteer session
interface VolunteerSession {
  volunteerName: string;
  sessionStarted: string;
}

// Child info for toy distribution
type ChildGender = 'boy' | 'girl';

interface ChildInfo {
  age: number;
  gender: ChildGender;
}

// Ticket
interface Ticket {
  id: string;
  recipientName: string;
  phoneNumber: string;
  email: string;
  adultCount: number;
  childCount: number;
  children?: ChildInfo[];  // Age and gender for each child
  groupSize: number;
  specialNeeds?: string;
  rsvpStatus: 'confirmed' | 'declined';
  status: 'issued' | 'checked-in';
  createdAt: string;
  createdBy: string;
}

// Walk-in (no ticket)
interface WalkIn {
  id: string;
  name: string;
  phoneNumber: string;
  adultCount: number;
  childCount: number;
  children?: ChildInfo[];  // Age and gender for each child
  totalCount: number;
  checkedInAt: string;
  checkedInBy: string;
}
```

## Development Guidelines

- Keep components simple and focused
- Use Tailwind utility classes for styling
- All user-facing text should use bilingual labels
- Validate inputs on client side
- Handle offline scenarios gracefully
- Target non-technical users - prioritize clarity over features
