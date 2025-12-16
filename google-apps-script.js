/**
 * SVDP Event Tracker - Google Apps Script
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Sheet
 * 2. Create three sheets (tabs) named exactly: "Tickets", "CheckIns", "WalkIns"
 * 3. Go to Extensions > Apps Script
 * 4. Delete any existing code and paste this entire file
 * 5. Click "Deploy" > "New deployment"
 * 6. Select type: "Web app"
 * 7. Set "Execute as": "Me"
 * 8. Set "Who has access": "Anyone"
 * 9. Click "Deploy" and authorize when prompted
 * 10. Copy the Web app URL and add it to your .env file as VITE_GOOGLE_SHEETS_URL
 *
 * SHEET HEADERS (add these to row 1 of each sheet):
 *
 * Tickets sheet:
 * ID | Recipient Name | Phone | Email | Adults | Children | Children Details | Group Size | Special Needs | RSVP Status | Status | Created At | Created By
 *
 * CheckIns sheet:
 * Ticket ID | Recipient Name | Checked In At | Checked In By | Expected Adults | Expected Children | Expected Total | Actual Adults | Actual Children | Actual Total | Children Details
 *
 * WalkIns sheet:
 * ID | Name | Phone | Adults | Children | Children Details | Total | Checked In At | Checked In By
 */

// Handle POST requests from the web app
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(data.sheet);

    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Sheet not found: ' + data.sheet
      })).setMimeType(ContentService.MimeType.JSON);
    }

    if (data.action === 'create') {
      appendRow(sheet, data.sheet, data.data);
    } else if (data.action === 'update') {
      updateRow(sheet, data.sheet, data.data);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle GET requests (for testing)
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'SVDP Event Tracker API is running',
    sheets: ['Tickets', 'CheckIns', 'WalkIns']
  })).setMimeType(ContentService.MimeType.JSON);
}

// Append a new row to the specified sheet
function appendRow(sheet, sheetName, data) {
  let row = [];

  if (sheetName === 'Tickets') {
    row = [
      data.id,
      data.recipientName,
      data.phoneNumber,
      data.email,
      data.adultCount,
      data.childCount,
      data.children || '',
      data.groupSize,
      data.specialNeeds || '',
      data.rsvpStatus,
      data.status,
      formatDate(data.createdAt),
      data.createdBy
    ];
  } else if (sheetName === 'CheckIns') {
    row = [
      data.ticketId,
      data.recipientName,
      formatDate(data.checkedInAt),
      data.checkedInBy,
      data.expectedAdults,
      data.expectedChildren,
      data.expectedTotal,
      data.actualAdults,
      data.actualChildren,
      data.actualTotal,
      data.children || ''
    ];
  } else if (sheetName === 'WalkIns') {
    row = [
      data.id,
      data.name,
      data.phoneNumber,
      data.adultCount,
      data.childCount,
      data.children || '',
      data.totalCount,
      formatDate(data.checkedInAt),
      data.checkedInBy
    ];
  }

  sheet.appendRow(row);
}

// Update an existing row (find by ID in first column)
function updateRow(sheet, sheetName, data) {
  const idColumn = 1; // ID is in the first column
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  // Find the row with matching ID
  let rowIndex = -1;
  const idToFind = sheetName === 'CheckIns' ? data.ticketId : data.id;

  for (let i = 1; i < values.length; i++) { // Start at 1 to skip header
    if (values[i][0] === idToFind) {
      rowIndex = i + 1; // Sheet rows are 1-indexed
      break;
    }
  }

  if (rowIndex === -1) {
    // If not found, append as new row
    appendRow(sheet, sheetName, data);
    return;
  }

  // Update the row
  let row = [];

  if (sheetName === 'Tickets') {
    row = [
      data.id,
      data.recipientName,
      data.phoneNumber,
      data.email,
      data.adultCount,
      data.childCount,
      data.children || '',
      data.groupSize,
      data.specialNeeds || '',
      data.rsvpStatus,
      data.status,
      formatDate(data.createdAt),
      data.createdBy
    ];
  }

  if (row.length > 0) {
    sheet.getRange(rowIndex, 1, 1, row.length).setValues([row]);
  }
}

// Format ISO date string to readable format
function formatDate(isoString) {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return Utilities.formatDate(date, Session.getScriptTimeZone(), 'MM/dd/yyyy HH:mm:ss');
  } catch (e) {
    return isoString;
  }
}

// Utility function to set up headers (run manually once)
function setupHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Tickets headers
  const ticketsSheet = ss.getSheetByName('Tickets');
  if (ticketsSheet) {
    ticketsSheet.getRange(1, 1, 1, 13).setValues([[
      'ID', 'Recipient Name', 'Phone', 'Email', 'Adults', 'Children',
      'Children Details', 'Group Size', 'Special Needs', 'RSVP Status',
      'Status', 'Created At', 'Created By'
    ]]);
    ticketsSheet.getRange(1, 1, 1, 13).setFontWeight('bold');
  }

  // CheckIns headers
  const checkInsSheet = ss.getSheetByName('CheckIns');
  if (checkInsSheet) {
    checkInsSheet.getRange(1, 1, 1, 11).setValues([[
      'Ticket ID', 'Recipient Name', 'Checked In At', 'Checked In By',
      'Expected Adults', 'Expected Children', 'Expected Total',
      'Actual Adults', 'Actual Children', 'Actual Total', 'Children Details'
    ]]);
    checkInsSheet.getRange(1, 1, 1, 11).setFontWeight('bold');
  }

  // WalkIns headers
  const walkInsSheet = ss.getSheetByName('WalkIns');
  if (walkInsSheet) {
    walkInsSheet.getRange(1, 1, 1, 9).setValues([[
      'ID', 'Name', 'Phone', 'Adults', 'Children', 'Children Details',
      'Total', 'Checked In At', 'Checked In By'
    ]]);
    walkInsSheet.getRange(1, 1, 1, 9).setFontWeight('bold');
  }

  SpreadsheetApp.getUi().alert('Headers have been set up!');
}
