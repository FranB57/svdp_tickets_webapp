import { QRCodeSVG } from 'qrcode.react';
import type { Ticket } from '../../types';
import { useLabels } from '../../hooks/useLabels';

interface TicketPreviewProps {
  ticket: Ticket;
}

// Generate QR payload from ticket
export function generateQRPayload(ticket: Ticket): string {
  const payload = {
    id: ticket.id,
    n: ticket.recipientName.substring(0, 30),
    g: ticket.groupSize,
    v: 1,
  };
  return JSON.stringify(payload);
}

export function TicketPreview({ ticket }: TicketPreviewProps) {
  const { t } = useLabels();
  const qrData = generateQRPayload(ticket);

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden max-w-md mx-auto shadow-lg">
      {/* Header stripe */}
      <div className="bg-svdp-blue text-white py-3 px-4">
        <h2 className="text-lg font-bold text-center">
          {t('eventTitle')}
        </h2>
        <p className="text-sm text-center text-svdp-blue-100">
          {t('eventSubtitle')}
        </p>
      </div>

      {/* Event details */}
      <div className="bg-svdp-blue-50 py-2 px-4 text-center text-sm">
        <p className="text-svdp-blue-700">{t('eventDate')}</p>
        <p className="text-svdp-blue-600 font-medium">{t('eventTime')}</p>
        <p className="text-svdp-blue-700">{t('eventLocation')}</p>
      </div>

      {/* Main content */}
      <div className="p-6 text-center">
        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white border border-gray-200 rounded-lg">
            <QRCodeSVG
              value={qrData}
              size={128}
              level="M"
              includeMargin={false}
            />
          </div>
        </div>

        {/* Guest name */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 uppercase">
          {ticket.recipientName}
        </h3>

        {/* Guest counts */}
        <div className="border-t border-b border-gray-200 py-3 mb-3">
          <p className="text-gray-700">
            <span className="font-semibold">{t('total')}:</span>{' '}
            {ticket.groupSize} {ticket.groupSize === 1 ? t('guest') : t('guests')}
          </p>
          <div className="flex justify-center gap-6 mt-1 text-sm text-gray-600">
            <span>{t('adults')}: {ticket.adultCount}</span>
            <span>{t('children')}: {ticket.childCount}</span>
          </div>
        </div>

        {/* Ticket number and date */}
        <div className="text-sm text-gray-500">
          <p>
            {t('ticketNumber')} #{ticket.id}
          </p>
          <p>
            {t('issued')}: {new Date(ticket.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-svdp-blue text-white py-2 px-4 text-center text-sm">
        {t('showTicketAtCheckin')}
      </div>
    </div>
  );
}
