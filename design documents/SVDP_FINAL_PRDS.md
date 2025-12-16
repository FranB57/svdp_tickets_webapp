# SVDP Event Tracker - Finalized Feature PRDs

**Timeline:** Single night implementation  
**Priority Order:** Ticket Issuance → QR Scanning → Walk-ins → Multi-language → Offline → Volunteer Tracking → Stats

---

# PRD 1: Volunteer Authentication

## Overview
| Attribute | Value |
|-----------|-------|
| Priority | P1 (Build 6th) |
| Effort | 30 minutes |
| Dependencies | None |

## Summary
Simple name + PIN authentication for volunteer identification. Tracks who performed actions but not critical for accountability.

## Requirements

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| AUTH-1 | Volunteer enters name (free text) | Must |
| AUTH-2 | Volunteer enters 4-digit PIN | Must |
| AUTH-3 | Credentials persist in localStorage | Must |
| AUTH-4 | "Switch User" option in settings | Should |
| AUTH-5 | Name attached to all tickets/check-ins | Must |

### User Flow
```
┌─────────────────────────────────────────┐
│       🎄 SVDP Event Tracker             │
│                                         │
│   Enter your name                       │
│   ┌─────────────────────────────────┐   │
│   │ Maria Santos                    │   │
│   └─────────────────────────────────┘   │
│                                         │
│   Enter PIN (4 digits)                  │
│   ┌─────────────────────────────────┐   │
│   │ ● ● ● ●                         │   │
│   └─────────────────────────────────┘   │
│                                         │
│   ┌─────────────────────────────────┐   │
│   │         CONTINUE →              │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Data Model
```typescript
interface VolunteerSession {
  volunteerName: string;
  pin: string;           // 4 digits, stored locally only
  sessionStarted: string;
}
```

### Validation
- Name: Required, 2-50 characters
- PIN: Required, exactly 4 digits

### Notes
- PIN is for basic access control, not security
- All volunteers can use same PIN if preferred (e.g., "1234")
- No server-side authentication needed

---

# PRD 2: Ticket Issuance System

## Overview
| Attribute | Value |
|-----------|-------|
| Priority | P0 (Build 1st) |
| Effort | 2 hours |
| Dependencies | Auth (can stub initially) |

## Summary
Create digital tickets for ~50 families with QR codes. Tickets downloadable as PDF for volunteer to send via text/email.

## Requirements

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| TKT-1 | Form with all required fields | Must |
| TKT-2 | Generate unique ticket ID | Must |
| TKT-3 | Generate QR code with ticket data | Must |
| TKT-4 | Generate downloadable PDF ticket | Must |
| TKT-5 | Save ticket to Google Sheets | Must |
| TKT-6 | Show success with download option | Must |
| TKT-7 | RSVP status (Confirmed/Declined) | Must |
| TKT-8 | Spanish language ticket option | Should |

### Required Fields
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Recipient Name | Text | Yes | 2-100 chars |
| Phone Number | Tel | Yes | Valid US format |
| Email Address | Email | Yes | Valid email |
| Number of Adults | Number | Yes | 0-20 |
| Number of Children | Number | Yes | 0-20 |
| Special Needs | Text | No | Max 500 chars |
| RSVP Status | Select | Yes | Confirmed/Declined |

### User Flow
```
┌─────────────────────────────────────────┐
│  ← Home        Crear Boleto / Issue     │
├─────────────────────────────────────────┤
│                                         │
│  Nombre / Name *                        │
│  ┌─────────────────────────────────┐   │
│  │ Familia Garcia                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Teléfono / Phone *                     │
│  ┌─────────────────────────────────┐   │
│  │ (555) 123-4567                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Correo / Email *                       │
│  ┌─────────────────────────────────┐   │
│  │ garcia@email.com                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Adultos / Adults    Niños / Children   │
│  ┌───────────┐       ┌───────────┐     │
│  │ [-] 2 [+] │       │ [-] 3 [+] │     │
│  └───────────┘       └───────────┘     │
│  Total: 5 personas / people             │
│                                         │
│  Necesidades Especiales / Special Needs │
│  ┌─────────────────────────────────┐   │
│  │ Wheelchair access needed        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Estado RSVP / Status                   │
│  ┌─────────────────────────────────┐   │
│  │ ◉ Confirmado / Confirmed        │   │
│  │ ○ Rechazado / Declined          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   ✓ CREAR BOLETO / CREATE       │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Success Screen
```
┌─────────────────────────────────────────┐
│         ¡Boleto Creado! 🎉              │
│         Ticket Created!                 │
├─────────────────────────────────────────┤
│                                         │
│         ┌─────────────────┐             │
│         │   ██████████    │             │
│         │   ██ QR  ██    │             │
│         │   ██████████    │             │
│         └─────────────────┘             │
│                                         │
│         Familia Garcia                  │
│         5 personas (2 adultos, 3 niños) │
│         Boleto #A1B2C3D4                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     📥 DESCARGAR PDF            │   │
│  │         Download PDF             │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     ➕ CREAR OTRO               │   │
│  │         Create Another           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### PDF Ticket Design
```
┌────────────────────────────────────────┐
│ ████████████████████████████████████   │
│   SVDP CHRISTMAS BREAKFAST 2024        │
│   DESAYUNO NAVIDEÑO 2024               │
│   [DATE] • [TIME] • [LOCATION]         │
├────────────────────────────────────────┤
│                                        │
│   [LOGO PLACEHOLDER]                   │
│                                        │
│        ┌──────────────┐                │
│        │   QR CODE    │                │
│        └──────────────┘                │
│                                        │
│        FAMILIA GARCIA                  │
│                                        │
│   ────────────────────────────         │
│   Total: 5 personas / people           │
│   Adultos / Adults: 2                  │
│   Niños / Children: 3                  │
│   ────────────────────────────         │
│                                        │
│   Boleto / Ticket #A1B2C3D4            │
│   Expedido / Issued: Dec 15, 2024      │
│                                        │
├────────────────────────────────────────┤
│   Presente este boleto en la entrada   │
│   Show this ticket at check-in         │
│ ████████████████████████████████████   │
└────────────────────────────────────────┘
```

### Data Model
```typescript
interface Ticket {
  id: string;                    // UUID (8 char display)
  recipientName: string;
  phoneNumber: string;
  email: string;
  adultCount: number;
  childCount: number;
  groupSize: number;             // Computed
  specialNeeds?: string;
  rsvpStatus: 'confirmed' | 'declined';
  status: 'issued' | 'checked-in';
  createdAt: string;
  createdBy: string;             // Volunteer name
}
```

### QR Code Payload
```typescript
interface QRPayload {
  id: string;         // Ticket ID
  n: string;          // Name (truncated to 30 chars)
  g: number;          // Group size
  v: 1;               // Version for future compat
}
// Encoded as JSON, ~100 bytes
```

---

# PRD 3: QR Code Scanner & Check-in

## Overview
| Attribute | Value |
|-----------|-------|
| Priority | P0 (Build 2nd) |
| Effort | 2 hours |
| Dependencies | Ticket Issuance |

## Summary
Scan ticket QR codes to check in families. Show info, allow count modification, require manual confirmation. Block duplicate check-ins completely.

## Requirements

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| SCN-1 | Camera viewfinder with QR detection | Must |
| SCN-2 | Parse QR and fetch ticket data | Must |
| SCN-3 | Display ticket info after scan | Must |
| SCN-4 | Allow adult/child count modification | Must |
| SCN-5 | Manual confirmation button | Must |
| SCN-6 | Block duplicate check-ins with error | Must |
| SCN-7 | Manual ticket ID entry fallback | Must |
| SCN-8 | Save check-in to Google Sheets | Must |
| SCN-9 | Bilingual UI (EN/ES) | Should |

### User Flow - Scanning
```
┌─────────────────────────────────────────┐
│  ← Home       Escanear / Scan           │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │                                 │   │
│  │    ┌───────────────────┐        │   │
│  │    │                   │        │   │
│  │    │   [ CAMERA ]      │        │   │
│  │    │   [ VIEW   ]      │        │   │
│  │    │                   │        │   │
│  │    └───────────────────┘        │   │
│  │                                 │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Apunte al código QR                    │
│  Point at QR code                       │
│                                         │
│  ─────────── O / OR ───────────         │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ⌨️ Ingresar ID manualmente     │   │
│  │     Enter ID manually           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### User Flow - Verification
```
┌─────────────────────────────────────────┐
│  ← Escanear     Verificar / Verify      │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ✓ Boleto Válido / Valid Ticket │   │
│  └─────────────────────────────────┘   │
│                                         │
│  FAMILIA GARCIA                         │
│  Boleto #A1B2C3D4                       │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  ESPERADO         ACTUAL                │
│  Expected         Actual                │
│                                         │
│  2 Adultos  →     ┌───────────┐         │
│  Adults           │ [-] 2 [+] │         │
│                   └───────────┘         │
│                                         │
│  3 Niños    →     ┌───────────┐         │
│  Children         │ [-] 3 [+] │         │
│                   └───────────┘         │
│                                         │
│  Total: 5 personas                      │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   ✓ CONFIRMAR ENTRADA           │   │
│  │     Confirm Check-in             │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### User Flow - Duplicate Error
```
┌─────────────────────────────────────────┐
│            ❌ ERROR                      │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  ⚠️ YA REGISTRADO               │   │
│  │     Already Checked In           │   │
│  └─────────────────────────────────┘   │
│                                         │
│  FAMILIA GARCIA                         │
│  ya ingresó a las 9:32 AM               │
│  already checked in at 9:32 AM          │
│                                         │
│  Registrado por: Maria                  │
│  Checked in by: Maria                   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │     ← ESCANEAR OTRO             │   │
│  │        Scan Another              │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Manual Entry Flow
```
┌─────────────────────────────────────────┐
│  ← Escanear   Buscar / Search           │
├─────────────────────────────────────────┤
│                                         │
│  Buscar por nombre o teléfono           │
│  Search by name or phone                │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🔍 Garcia                       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Resultados / Results:                  │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Familia Garcia                  │   │
│  │ (555) 123-4567 • 5 personas     │   │
│  │ Boleto #A1B2C3D4                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ Familia Garcia Lopez            │   │
│  │ (555) 987-6543 • 3 personas     │   │
│  │ Boleto #E5F6G7H8                │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Data Model
```typescript
interface CheckIn {
  ticketId: string;
  checkedInAt: string;
  checkedInBy: string;
  actualAdults: number;
  actualChildren: number;
  actualTotal: number;
}
```

### Error Handling
| Scenario | Behavior |
|----------|----------|
| Invalid QR | "Código inválido / Invalid code" - continue scanning |
| Ticket not found | Show search option |
| Already checked in | Block with error message (no override) |
| Camera denied | Show manual entry option |
| Network error | Queue locally, show pending indicator |

---

# PRD 4: Walk-in Registration

## Overview
| Attribute | Value |
|-----------|-------|
| Priority | P1 (Build 3rd) |
| Effort | 45 minutes |
| Dependencies | Scanner (shares UI patterns) |

## Summary
Quick registration for attendees without tickets. Separate from ticketed guests in data. Same benefits as ticketed.

## Requirements

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| WLK-1 | Minimal form (name, phone, counts) | Must |
| WLK-2 | Quick submit (< 30 seconds) | Must |
| WLK-3 | Save to separate Walk-ins sheet | Must |
| WLK-4 | Bilingual labels | Should |

### Required Fields
| Field | Type | Required |
|-------|------|----------|
| Name | Text | Yes |
| Phone Number | Tel | Yes |
| Adults | Number | Yes |
| Children | Number | Yes |

### User Flow
```
┌─────────────────────────────────────────┐
│  ← Escanear    Sin Boleto / No Ticket   │
├─────────────────────────────────────────┤
│                                         │
│  Registro de visitante sin boleto       │
│  Walk-in registration                   │
│                                         │
│  Nombre / Name *                        │
│  ┌─────────────────────────────────┐   │
│  │ Familia Martinez                │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Teléfono / Phone *                     │
│  ┌─────────────────────────────────┐   │
│  │ (555) 222-3333                  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Adultos / Adults    Niños / Children   │
│  ┌───────────┐       ┌───────────┐     │
│  │ [-] 1 [+] │       │ [-] 2 [+] │     │
│  └───────────┘       └───────────┘     │
│                                         │
│  Total: 3 personas / people             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   ✓ REGISTRAR ENTRADA           │   │
│  │     Register Entry               │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Data Model
```typescript
interface WalkIn {
  id: string;
  name: string;
  phoneNumber: string;
  adultCount: number;
  childCount: number;
  totalCount: number;
  checkedInAt: string;
  checkedInBy: string;
}
```

---

# PRD 5: Multi-language Support (EN/ES)

## Overview
| Attribute | Value |
|-----------|-------|
| Priority | P1 (Build 4th) |
| Effort | 30 minutes |
| Dependencies | All UI components |

## Summary
All UI text displayed in both English and Spanish. No language toggle needed - show both simultaneously.

## Requirements

### Approach: Dual Display
Rather than a toggle, show both languages on all labels:

```
Nombre / Name
Teléfono / Phone
Adultos / Adults
Niños / Children
Crear Boleto / Create Ticket
Escanear / Scan
```

### Implementation
```typescript
// Simple translation object
const labels = {
  name: { es: 'Nombre', en: 'Name' },
  phone: { es: 'Teléfono', en: 'Phone' },
  adults: { es: 'Adultos', en: 'Adults' },
  children: { es: 'Niños', en: 'Children' },
  createTicket: { es: 'Crear Boleto', en: 'Create Ticket' },
  scan: { es: 'Escanear', en: 'Scan' },
  // ... etc
};

// Usage: shows "Nombre / Name"
const Label = ({ id }) => (
  <span>{labels[id].es} / {labels[id].en}</span>
);
```

### Key Translations
| English | Spanish |
|---------|---------|
| Issue Ticket | Crear Boleto |
| Scan Ticket | Escanear Boleto |
| Check In | Registrar Entrada |
| Walk-in | Sin Boleto |
| Adults | Adultos |
| Children | Niños |
| Name | Nombre |
| Phone | Teléfono |
| Email | Correo |
| Confirm | Confirmar |
| Cancel | Cancelar |
| Download PDF | Descargar PDF |
| Already checked in | Ya registrado |
| Invalid ticket | Boleto inválido |
| Success | Éxito |
| Error | Error |
| Search | Buscar |
| History | Historial |
| Settings | Configuración |

---

# PRD 6: Offline Support

## Overview
| Attribute | Value |
|-----------|-------|
| Priority | P2 (Build 5th) |
| Effort | 45 minutes |
| Dependencies | All data operations |

## Summary
Queue actions locally when offline. Auto-sync when connectivity returns. Visual indicator of status.

## Requirements

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| OFF-1 | Detect online/offline status | Must |
| OFF-2 | Queue ticket/check-in actions locally | Must |
| OFF-3 | Auto-sync when back online | Must |
| OFF-4 | Show connection status indicator | Must |
| OFF-5 | Show pending action count | Should |

### UI Indicator
```
┌─────────────────────────────────────────┐
│  Always visible in header:              │
├─────────────────────────────────────────┤
│                                         │
│  Online:                                │
│  ┌─────────────────────────────────┐   │
│  │ 🟢 Conectado / Connected        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Offline with pending:                  │
│  ┌─────────────────────────────────┐   │
│  │ 🔴 Sin conexión (3 pendientes)  │   │
│  │    Offline (3 pending)          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Syncing:                               │
│  ┌─────────────────────────────────┐   │
│  │ 🟡 Sincronizando... (2/5)       │   │
│  │    Syncing...                   │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

### Data Model
```typescript
interface PendingAction {
  id: string;
  type: 'createTicket' | 'checkIn' | 'walkIn';
  data: Ticket | CheckIn | WalkIn;
  timestamp: string;
  retryCount: number;
}

interface SyncState {
  isOnline: boolean;
  pending: PendingAction[];
  isSyncing: boolean;
  lastSyncAt?: string;
}
```

### Sync Logic
1. On form submit → Save to localStorage queue
2. If online → Immediately attempt sync
3. If offline → Keep in queue
4. On reconnect → Process queue in order
5. On success → Remove from queue
6. On failure → Increment retry, keep in queue

---

# PRD 7: History View

## Overview
| Attribute | Value |
|-----------|-------|
| Priority | P2 (Build 7th) |
| Effort | 30 minutes |
| Dependencies | All data operations |

## Summary
Show volunteer's own activity. All-time history. No undo capability.

## Requirements

### Functional Requirements
| ID | Requirement | Priority |
|----|-------------|----------|
| HST-1 | List volunteer's own tickets issued | Must |
| HST-2 | List volunteer's own check-ins | Must |
| HST-3 | Show timestamp and basic details | Must |
| HST-4 | All-time persistence | Must |
| HST-5 | Pull to refresh | Should |

### User Flow
```
┌─────────────────────────────────────────┐
│  ← Home      Historial / History        │
├─────────────────────────────────────────┤
│                                         │
│  Resumen / Summary                      │
│  ┌─────────────────────────────────┐   │
│  │ 🎫 12 Boletos / Tickets         │   │
│  │ ✓  8 Entradas / Check-ins       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Actividad Reciente / Recent Activity   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ ✓ Familia Garcia                │   │
│  │   Entrada • 5 personas          │   │
│  │   Check-in • 5 people           │   │
│  │   Hace 2 min / 2 min ago        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 👥 Familia Martinez (sin boleto)│   │
│  │   Walk-in • 3 personas          │   │
│  │   Hace 5 min / 5 min ago        │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ 🎫 Familia Rodriguez            │   │
│  │   Boleto creado • 4 personas    │   │
│  │   Ticket issued • 4 people      │   │
│  │   Hace 12 min / 12 min ago      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Data Model
```typescript
interface ActivityItem {
  id: string;
  type: 'ticket' | 'checkin' | 'walkin';
  name: string;
  count: number;
  timestamp: string;
  volunteerName: string;
}
```

---

# PRD 8: Statistics Summary

## Overview
| Attribute | Value |
|-----------|-------|
| Priority | P3 (Build last, if time) |
| Effort | 20 minutes |
| Dependencies | All data |

## Summary
Simple stats on home page. Total checked in vs expected. Tickets issued vs used. Google Sheets is primary reporting.

## Requirements

### Home Page Stats Widget
```
┌─────────────────────────────────────────┐
│  Estadísticas / Statistics              │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Registrados / Checked In       │   │
│  │       47 / 52                   │   │
│  │  ████████████████░░░░  (90%)    │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Boletos / Tickets              │   │
│  │  Creados: 52  |  Usados: 47     │   │
│  │  Issued: 52   |  Used: 47       │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

---

# Implementation Order & Time Estimates

## Phase 1: Core Functionality (3-4 hours)

| Order | Feature | Time | Notes |
|-------|---------|------|-------|
| 1 | Project Setup (Vite + React + TS + Tailwind) | 20 min | |
| 2 | Ticket Issuance Form | 60 min | Core feature |
| 3 | QR Generation + PDF | 30 min | Part of ticket |
| 4 | QR Scanner | 60 min | html5-qrcode |
| 5 | Check-in Flow | 30 min | Post-scan |

## Phase 2: Additional Features (2-3 hours)

| Order | Feature | Time | Notes |
|-------|---------|------|-------|
| 6 | Walk-in Registration | 30 min | Reuse form patterns |
| 7 | Bilingual Labels | 30 min | Add ES throughout |
| 8 | Volunteer Auth | 20 min | Simple gate |
| 9 | Offline Queue | 45 min | localStorage |
| 10 | History View | 30 min | List from local |
| 11 | Stats Widget | 20 min | If time permits |

## Phase 3: Integration (1 hour)

| Order | Feature | Time | Notes |
|-------|---------|------|-------|
| 12 | Google Sheets Connection | 45 min | API + Apps Script |
| 13 | Testing & Polish | 15 min | |

**Total Estimated Time: 6-8 hours**

---

# Google Sheets Schema

## Sheet: "Tickets"
| Column | Field | Example |
|--------|-------|---------|
| A | ID | a1b2c3d4 |
| B | Name | Familia Garcia |
| C | Phone | (555) 123-4567 |
| D | Email | garcia@email.com |
| E | Adults | 2 |
| F | Children | 3 |
| G | Total | 5 |
| H | Special Needs | Wheelchair |
| I | RSVP Status | confirmed |
| J | Ticket Status | checked-in |
| K | Created At | 2024-12-15T10:30:00Z |
| L | Created By | Maria |
| M | Checked In At | 2024-12-21T09:15:00Z |
| N | Checked In By | Juan |
| O | Actual Adults | 2 |
| P | Actual Children | 2 |

## Sheet: "Walk-Ins"
| Column | Field | Example |
|--------|-------|---------|
| A | ID | w1x2y3z4 |
| B | Name | Familia Martinez |
| C | Phone | (555) 222-3333 |
| D | Adults | 1 |
| E | Children | 2 |
| F | Total | 3 |
| G | Checked In At | 2024-12-21T09:20:00Z |
| H | Checked In By | Maria |

---

*Document Version: 2.0 - Finalized*
*Based on completed questionnaire*
