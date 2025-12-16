import type { Language } from '../contexts/LanguageContext';

// Bilingual labels (Spanish / English)
export const labels = {
  // App title
  appTitle: { es: 'SVDP Event Tracker', en: 'SVDP Event Tracker' },

  // Auth page
  enterName: { es: 'Ingrese su nombre', en: 'Enter your name' },
  enterPin: { es: 'Ingrese PIN (4 dígitos)', en: 'Enter PIN (4 digits)' },
  continue: { es: 'Continuar', en: 'Continue' },
  invalidPin: { es: 'PIN inválido', en: 'Invalid PIN' },
  nameRequired: { es: 'Nombre requerido', en: 'Name required' },
  nameTooShort: { es: 'Nombre muy corto (mín. 2 caracteres)', en: 'Name too short (min. 2 characters)' },
  pinRequired: { es: 'PIN requerido', en: 'PIN required' },
  pinMustBe4Digits: { es: 'PIN debe ser 4 dígitos', en: 'PIN must be 4 digits' },

  // Home page
  welcome: { es: 'Bienvenido', en: 'Welcome' },
  issueTicket: { es: 'Crear Boleto', en: 'Issue Ticket' },
  issueTicketDesc: { es: 'Crear un nuevo boleto para una familia', en: 'Create a new ticket for a family' },
  scanTicket: { es: 'Escanear', en: 'Scan' },
  scanTicketDesc: { es: 'Escanear código QR para check-in', en: 'Scan QR code for check-in' },
  history: { es: 'Historial', en: 'History' },
  historyDesc: { es: 'Ver tu actividad reciente', en: 'View your recent activity' },
  walkIn: { es: 'Sin Boleto', en: 'Walk-in' },
  walkInDesc: { es: 'Registrar visitante sin boleto', en: 'Register walk-in guest' },

  // Header
  switchUser: { es: 'Cambiar Usuario', en: 'Switch User' },
  settings: { es: 'Configuración', en: 'Settings' },
  language: { es: 'Idioma', en: 'Language' },
  spanish: { es: 'Español', en: 'Spanish' },
  english: { es: 'Inglés', en: 'English' },

  // Common
  name: { es: 'Nombre', en: 'Name' },
  phone: { es: 'Teléfono', en: 'Phone' },
  email: { es: 'Correo', en: 'Email' },
  adults: { es: 'Adultos', en: 'Adults' },
  children: { es: 'Niños', en: 'Children' },
  total: { es: 'Total', en: 'Total' },
  confirm: { es: 'Confirmar', en: 'Confirm' },
  cancel: { es: 'Cancelar', en: 'Cancel' },
  back: { es: 'Atrás', en: 'Back' },
  submit: { es: 'Enviar', en: 'Submit' },
  success: { es: 'Éxito', en: 'Success' },
  error: { es: 'Error', en: 'Error' },
  search: { es: 'Buscar', en: 'Search' },

  // Status
  connected: { es: 'Conectado', en: 'Connected' },
  offline: { es: 'Sin conexión', en: 'Offline' },
  syncing: { es: 'Sincronizando', en: 'Syncing' },

  // Placeholders
  comingSoon: { es: 'Próximamente', en: 'Coming Soon' },
  comingSoonTicket: { es: 'El formulario de creación de boletos estará aquí', en: 'Ticket creation form will be here' },
  comingSoonScan: { es: 'El escáner de códigos QR estará aquí', en: 'QR code scanner will be here' },
  comingSoonWalkIn: { es: 'El formulario de registro de visitantes estará aquí', en: 'Walk-in registration form will be here' },
  comingSoonHistory: { es: 'Tu historial de actividades estará aquí', en: 'Your activity history will be here' },

  // Footer
  christmasBreakfast: { es: 'Cena Navideña', en: 'Christmas Dinner' },

  // Ticket Issuance Form
  recipientName: { es: 'Nombre del Recipiente', en: 'Recipient Name' },
  phoneNumber: { es: 'Número de Teléfono', en: 'Phone Number' },
  emailAddress: { es: 'Correo Electrónico', en: 'Email Address' },
  numberOfAdults: { es: 'Número de Adultos', en: 'Number of Adults' },
  numberOfChildren: { es: 'Número de Niños', en: 'Number of Children' },
  specialNeeds: { es: 'Necesidades Especiales', en: 'Special Needs' },
  specialNeedsPlaceholder: { es: 'Acceso para silla de ruedas, etc.', en: 'Wheelchair access, etc.' },
  rsvpStatus: { es: 'Estado RSVP', en: 'RSVP Status' },
  confirmed: { es: 'Confirmado', en: 'Confirmed' },
  declined: { es: 'Rechazado', en: 'Declined' },
  createTicket: { es: 'Crear Boleto', en: 'Create Ticket' },
  people: { es: 'personas', en: 'people' },
  ticketCreated: { es: '¡Boleto Creado!', en: 'Ticket Created!' },
  downloadPdf: { es: 'Descargar PDF', en: 'Download PDF' },
  createAnother: { es: 'Crear Otro', en: 'Create Another' },
  ticketNumber: { es: 'Boleto', en: 'Ticket' },
  issued: { es: 'Expedido', en: 'Issued' },
  showTicketAtCheckin: { es: 'Presente este boleto en la entrada', en: 'Show this ticket at check-in' },

  // Event Details (placeholders)
  eventTitle: { es: 'SVDP Guadalupe Conference', en: 'SVDP Guadalupe Conference' },
  eventSubtitle: { es: 'Cena de Navidad', en: 'Christmas Dinner' },
  eventDate: { es: '20 de Diciembre, 2025', en: 'December 20, 2025' },
  eventTime: { es: '5:00 PM - 8:30 PM', en: '5:00 PM - 8:30 PM' },
  eventLocation: { es: 'Salo Parroquial Juan Diego', en: 'San Juan Diego Parish Hall' },
  eventAddress: { es: '11691 NW 25th St, Doral, FL 33172', en: '11691 NW 25th St, Doral, FL 33172' },

  // Form validation
  fieldRequired: { es: 'Este campo es requerido', en: 'This field is required' },
  invalidEmail: { es: 'Correo electrónico inválido', en: 'Invalid email address' },
  invalidPhone: { es: 'Número de teléfono inválido', en: 'Invalid phone number' },
  atLeastOnePerson: { es: 'Al menos 1 persona requerida', en: 'At least 1 person required' },

  // Guest count
  guests: { es: 'invitados', en: 'guests' },
  guest: { es: 'invitado', en: 'guest' },

  // Children details for toy distribution
  childDetails: { es: 'Detalles de los Niños', en: 'Children Details' },
  childNumber: { es: 'Niño', en: 'Child' },
  age: { es: 'Edad', en: 'Age' },
  gender: { es: 'Género', en: 'Gender' },
  boy: { es: 'Niño', en: 'Boy' },
  girl: { es: 'Niña', en: 'Girl' },
  years: { es: 'años', en: 'years' },
  selectAge: { es: 'Seleccionar edad', en: 'Select age' },
  selectGender: { es: 'Seleccionar género', en: 'Select gender' },
  forToyDistribution: { es: 'Para distribución de juguetes', en: 'For toy distribution' },

  // QR Scanner & Check-in
  pointAtQrCode: { es: 'Apunte al código QR', en: 'Point at QR code' },
  enterIdManually: { es: 'Ingresar ID manualmente', en: 'Enter ID manually' },
  or: { es: 'O', en: 'OR' },
  validTicket: { es: 'Boleto Válido', en: 'Valid Ticket' },
  verify: { es: 'Verificar', en: 'Verify' },
  expected: { es: 'Esperado', en: 'Expected' },
  actual: { es: 'Actual', en: 'Actual' },
  confirmCheckin: { es: 'Confirmar Entrada', en: 'Confirm Check-in' },
  checkinSuccess: { es: '¡Entrada Confirmada!', en: 'Check-in Confirmed!' },
  scanAnother: { es: 'Escanear Otro', en: 'Scan Another' },

  // Duplicate check-in error
  alreadyCheckedIn: { es: 'Ya Registrado', en: 'Already Checked In' },
  alreadyCheckedInAt: { es: 'ya ingresó a las', en: 'already checked in at' },
  checkedInBy: { es: 'Registrado por', en: 'Checked in by' },

  // Manual search
  searchByNameOrPhone: { es: 'Buscar por nombre o teléfono', en: 'Search by name or phone' },
  results: { es: 'Resultados', en: 'Results' },
  noResults: { es: 'No se encontraron resultados', en: 'No results found' },
  ticketNotFound: { es: 'Boleto no encontrado', en: 'Ticket not found' },

  // Scanner errors
  invalidQrCode: { es: 'Código inválido', en: 'Invalid code' },
  cameraAccessDenied: { es: 'Acceso a cámara denegado', en: 'Camera access denied' },
  tryManualEntry: { es: 'Intente ingresar el ID manualmente', en: 'Try entering the ID manually' },

  // Check-in status
  checkedIn: { es: 'Registrado', en: 'Checked In' },
  pending: { es: 'Pendiente', en: 'Pending' },
  person: { es: 'persona', en: 'person' },

  // Walk-in Registration
  walkInRegistration: { es: 'Registro de visitante sin boleto', en: 'Walk-in registration' },
  registerEntry: { es: 'Registrar Entrada', en: 'Register Entry' },
  walkInSuccess: { es: '¡Registro Exitoso!', en: 'Registration Successful!' },
  registerAnother: { es: 'Registrar Otro', en: 'Register Another' },
  noTicket: { es: 'Sin Boleto', en: 'No Ticket' },

  // History View
  recentActivity: { es: 'Actividad Reciente', en: 'Recent Activity' },
  summary: { es: 'Resumen', en: 'Summary' },
  ticketsIssued: { es: 'Boletos Creados', en: 'Tickets Issued' },
  checkIns: { es: 'Entradas', en: 'Check-ins' },
  walkIns: { es: 'Sin Boleto', en: 'Walk-ins' },
  ticketIssued: { es: 'Boleto creado', en: 'Ticket issued' },
  checkedInEntry: { es: 'Entrada', en: 'Check-in' },
  walkInEntry: { es: 'Sin boleto', en: 'Walk-in' },
  ago: { es: 'hace', en: 'ago' },
  minutesAgo: { es: 'min', en: 'min' },
  hoursAgo: { es: 'h', en: 'h' },
  justNow: { es: 'ahora', en: 'just now' },
  noActivity: { es: 'Sin actividad reciente', en: 'No recent activity' },

  // Statistics
  statistics: { es: 'Estadísticas', en: 'Statistics' },
  checkedInCount: { es: 'Registrados', en: 'Checked In' },
  expectedGuests: { es: 'Esperados', en: 'Expected' },
  ticketsCreated: { es: 'Creados', en: 'Created' },
  ticketsUsed: { es: 'Usados', en: 'Used' },
} as const;

export type LabelKey = keyof typeof labels;

// Get label in specified language
export function getLabel(key: LabelKey, language: Language): string {
  return labels[key][language];
}

// Create a label getter function for a specific language
export function createLabelGetter(language: Language) {
  return (key: LabelKey): string => labels[key][language];
}
