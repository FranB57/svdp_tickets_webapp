import { jsPDF } from 'jspdf';
import type { Ticket } from '../types';
import { generateQRPayload } from '../components/ticket/TicketPreview';

// Event details (placeholders - can be moved to config later)
const EVENT_CONFIG = {
  title: 'SVDP Guadalupe Conference',
  subtitle: 'Christmas Dinner / Cena de Navidad',
  date: 'December 21, 2024 / 21 de Diciembre, 2024',
  time: '5:00 PM - 8:00 PM',
  location: 'Guadalupe Parish / Parroquia de Guadalupe',
  address: '123 Main St, City, TX',
};

// SVDP Blue color
const SVDP_BLUE = { r: 0, g: 107, b: 168 };

// Generate QR code as data URL using canvas
async function generateQRDataUrl(data: string): Promise<string> {
  // Dynamically import QRCode library for canvas rendering
  const QRCode = await import('qrcode');
  return QRCode.toDataURL(data, {
    width: 150,
    margin: 1,
    errorCorrectionLevel: 'M',
  });
}

export async function generateTicketPdf(ticket: Ticket): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5', // Smaller format, good for tickets
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 10;
  const contentWidth = pageWidth - margin * 2;

  let y = margin;

  // Header bar
  doc.setFillColor(SVDP_BLUE.r, SVDP_BLUE.g, SVDP_BLUE.b);
  doc.rect(0, 0, pageWidth, 25, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(EVENT_CONFIG.title, pageWidth / 2, 10, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(EVENT_CONFIG.subtitle, pageWidth / 2, 17, { align: 'center' });

  y = 30;

  // Event details box
  doc.setFillColor(230, 243, 250); // Light blue background
  doc.rect(margin, y, contentWidth, 20, 'F');

  doc.setTextColor(0, 85, 136); // Darker blue text
  doc.setFontSize(9);
  doc.text(EVENT_CONFIG.date, pageWidth / 2, y + 5, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text(EVENT_CONFIG.time, pageWidth / 2, y + 10, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text(EVENT_CONFIG.location, pageWidth / 2, y + 15, { align: 'center' });

  y += 28;

  // QR Code
  const qrPayload = generateQRPayload(ticket);
  const qrDataUrl = await generateQRDataUrl(qrPayload);
  const qrSize = 40;
  const qrX = (pageWidth - qrSize) / 2;
  doc.addImage(qrDataUrl, 'PNG', qrX, y, qrSize, qrSize);

  y += qrSize + 8;

  // Guest name
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(ticket.recipientName.toUpperCase(), pageWidth / 2, y, { align: 'center' });

  y += 10;

  // Divider line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin + 20, y, pageWidth - margin - 20, y);

  y += 8;

  // Guest counts
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Total: ${ticket.groupSize} ${ticket.groupSize === 1 ? 'guest / invitado' : 'guests / invitados'}`, pageWidth / 2, y, { align: 'center' });

  y += 6;
  doc.setFontSize(10);
  doc.text(`Adults / Adultos: ${ticket.adultCount}    Children / Niños: ${ticket.childCount}`, pageWidth / 2, y, { align: 'center' });

  y += 8;

  // Divider line
  doc.line(margin + 20, y, pageWidth - margin - 20, y);

  y += 8;

  // Ticket info
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`Ticket / Boleto #${ticket.id}`, pageWidth / 2, y, { align: 'center' });

  y += 5;
  const issuedDate = new Date(ticket.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.text(`Issued / Expedido: ${issuedDate}`, pageWidth / 2, y, { align: 'center' });

  // Footer bar
  const footerHeight = 12;
  const footerY = pageHeight - footerHeight;
  doc.setFillColor(SVDP_BLUE.r, SVDP_BLUE.g, SVDP_BLUE.b);
  doc.rect(0, footerY, pageWidth, footerHeight, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('Show this ticket at check-in / Presente este boleto en la entrada', pageWidth / 2, footerY + 7, { align: 'center' });

  // Save the PDF
  const fileName = `ticket-${ticket.id}-${ticket.recipientName.replace(/\s+/g, '-').toLowerCase()}.pdf`;
  doc.save(fileName);
}
