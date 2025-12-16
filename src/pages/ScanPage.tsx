import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useLabels } from '../hooks/useLabels';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { QRScanner } from '../components/scanner/QRScanner';
import {
  getTicketById,
  getCheckInByTicketId,
  saveCheckIn,
  parseQRPayload,
  searchTickets,
} from '../services/ticketStorage';
import type { Ticket, CheckIn } from '../types';

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function MinusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

type ViewState =
  | { type: 'scanning' }
  | { type: 'manual-search' }
  | { type: 'verifying'; ticket: Ticket }
  | { type: 'duplicate'; ticket: Ticket; checkIn: CheckIn }
  | { type: 'success'; ticket: Ticket; checkIn: CheckIn };

function NumberCounter({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          disabled={value <= min}
        >
          <MinusIcon className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-xl font-semibold text-gray-900 w-8 text-center">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-10 h-10 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center hover:bg-gray-200 transition-colors disabled:opacity-50"
          disabled={value >= max}
        >
          <PlusIcon className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
}

export function ScanPage() {
  const navigate = useNavigate();
  const { t } = useLabels();
  const { session } = useAuth();

  const [viewState, setViewState] = useState<ViewState>({ type: 'scanning' });
  const [actualAdults, setActualAdults] = useState(0);
  const [actualChildren, setActualChildren] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Ticket[]>([]);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScan = useCallback((data: string) => {
    setScanError(null);

    // Try to parse QR payload
    const payload = parseQRPayload(data);
    if (!payload) {
      setScanError(t('invalidQrCode'));
      return;
    }

    // Look up ticket
    const ticket = getTicketById(payload.id);
    if (!ticket) {
      setScanError(t('ticketNotFound'));
      return;
    }

    // Check if already checked in
    const existingCheckIn = getCheckInByTicketId(ticket.id);
    if (existingCheckIn) {
      setViewState({ type: 'duplicate', ticket, checkIn: existingCheckIn });
      return;
    }

    // Set initial counts from ticket
    setActualAdults(ticket.adultCount);
    setActualChildren(ticket.childCount);
    setViewState({ type: 'verifying', ticket });
  }, [t]);

  const handleManualLookup = (ticketId: string) => {
    const ticket = getTicketById(ticketId);
    if (!ticket) {
      setScanError(t('ticketNotFound'));
      return;
    }

    const existingCheckIn = getCheckInByTicketId(ticket.id);
    if (existingCheckIn) {
      setViewState({ type: 'duplicate', ticket, checkIn: existingCheckIn });
      return;
    }

    setActualAdults(ticket.adultCount);
    setActualChildren(ticket.childCount);
    setViewState({ type: 'verifying', ticket });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      setSearchResults(searchTickets(query));
    } else {
      setSearchResults([]);
    }
  };

  const handleConfirmCheckIn = () => {
    if (viewState.type !== 'verifying') return;

    const checkIn: CheckIn = {
      ticketId: viewState.ticket.id,
      checkedInAt: new Date().toISOString(),
      checkedInBy: session?.volunteerName || 'Unknown',
      actualAdults,
      actualChildren,
      actualTotal: actualAdults + actualChildren,
    };

    saveCheckIn(checkIn);
    setViewState({ type: 'success', ticket: viewState.ticket, checkIn });
  };

  const handleScanAnother = () => {
    setViewState({ type: 'scanning' });
    setScanError(null);
    setSearchQuery('');
    setSearchResults([]);
  };

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Scanning view
  if (viewState.type === 'scanning') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 p-6 max-w-lg mx-auto w-full">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">{t('back')}</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('scanTicket')}</h1>

          {/* QR Scanner */}
          <div className="mb-4">
            <QRScanner onScan={handleScan} />
          </div>

          <p className="text-center text-gray-600 mb-4">{t('pointAtQrCode')}</p>

          {/* Scan error */}
          {scanError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-center">
              <p className="text-red-700 text-sm">{scanError}</p>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 border-t border-gray-300" />
            <span className="text-gray-500 text-sm">{t('or')}</span>
            <div className="flex-1 border-t border-gray-300" />
          </div>

          {/* Manual entry button */}
          <Button
            fullWidth
            variant="outline"
            onClick={() => setViewState({ type: 'manual-search' })}
          >
            ⌨️ {t('enterIdManually')}
          </Button>
        </main>
      </div>
    );
  }

  // Manual search view
  if (viewState.type === 'manual-search') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 p-6 max-w-lg mx-auto w-full">
          <button
            onClick={handleScanAnother}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">{t('back')}</span>
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('search')}</h1>

          <Input
            label={t('searchByNameOrPhone')}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Garcia / (555) 123-4567 / A1B2C3D4"
            autoFocus
          />

          {/* Search error */}
          {scanError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-4 text-center">
              <p className="text-red-700 text-sm">{scanError}</p>
            </div>
          )}

          {/* Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-medium text-gray-700 mb-3">{t('results')}:</h2>
              <div className="space-y-2">
                {searchResults.map((ticket) => {
                  const isCheckedIn = getCheckInByTicketId(ticket.id);
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => handleManualLookup(ticket.id)}
                      className={`w-full text-left p-4 rounded-lg border transition-colors ${
                        isCheckedIn
                          ? 'bg-gray-100 border-gray-200'
                          : 'bg-white border-gray-200 hover:border-svdp-blue'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">{ticket.recipientName}</p>
                          <p className="text-sm text-gray-500">
                            {ticket.phoneNumber} • {ticket.groupSize} {t('people')}
                          </p>
                          <p className="text-xs text-gray-400">
                            {t('ticketNumber')} #{ticket.id}
                          </p>
                        </div>
                        {isCheckedIn && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {t('checkedIn')}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {searchQuery.trim().length >= 2 && searchResults.length === 0 && (
            <p className="text-center text-gray-500 mt-6">{t('noResults')}</p>
          )}
        </main>
      </div>
    );
  }

  // Verification view
  if (viewState.type === 'verifying') {
    const { ticket } = viewState;
    const totalActual = actualAdults + actualChildren;

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 p-6 max-w-lg mx-auto w-full">
          <button
            onClick={handleScanAnother}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">{t('back')}</span>
          </button>

          {/* Valid ticket badge */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 text-center">
            <p className="text-green-700 font-medium">✓ {t('validTicket')}</p>
          </div>

          {/* Ticket info */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 uppercase">{ticket.recipientName}</h2>
            <p className="text-gray-500">{t('ticketNumber')} #{ticket.id}</p>
          </div>

          {/* Count modification */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-2 gap-4 mb-4 text-center text-sm font-medium text-gray-500">
              <div>{t('expected')}</div>
              <div>{t('actual')}</div>
            </div>

            <div className="space-y-4">
              {/* Adults */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="text-center">
                  <span className="text-lg font-semibold text-gray-400">{ticket.adultCount}</span>
                  <span className="text-gray-400 ml-1">{t('adults')}</span>
                </div>
                <NumberCounter
                  label=""
                  value={actualAdults}
                  onChange={setActualAdults}
                />
              </div>

              {/* Children */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div className="text-center">
                  <span className="text-lg font-semibold text-gray-400">{ticket.childCount}</span>
                  <span className="text-gray-400 ml-1">{t('children')}</span>
                </div>
                <NumberCounter
                  label=""
                  value={actualChildren}
                  onChange={setActualChildren}
                />
              </div>
            </div>

            {/* Total */}
            <div className="border-t border-gray-200 mt-4 pt-4 text-center">
              <span className="text-lg font-semibold text-gray-900">
                {t('total')}: {totalActual} {totalActual === 1 ? t('person') : t('people')}
              </span>
            </div>
          </div>

          {/* Confirm button */}
          <Button
            fullWidth
            size="lg"
            onClick={handleConfirmCheckIn}
            disabled={totalActual < 1}
          >
            ✓ {t('confirmCheckin')}
          </Button>
        </main>
      </div>
    );
  }

  // Duplicate error view
  if (viewState.type === 'duplicate') {
    const { ticket, checkIn } = viewState;

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900">{t('error')}</h1>
          </div>

          {/* Already checked in badge */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-center">
            <p className="text-yellow-700 font-medium">⚠️ {t('alreadyCheckedIn')}</p>
          </div>

          {/* Info */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 uppercase mb-2">{ticket.recipientName}</h2>
            <p className="text-gray-600">
              {t('alreadyCheckedInAt')} {formatTime(checkIn.checkedInAt)}
            </p>
            <p className="text-gray-500 text-sm mt-1">
              {t('checkedInBy')}: {checkIn.checkedInBy}
            </p>
            <p className="text-gray-400 text-sm mt-2">
              {checkIn.actualTotal} {checkIn.actualTotal === 1 ? t('person') : t('people')}
            </p>
          </div>

          {/* Scan another button */}
          <Button fullWidth size="lg" variant="outline" onClick={handleScanAnother}>
            ← {t('scanAnother')}
          </Button>
        </main>
      </div>
    );
  }

  // Success view
  if (viewState.type === 'success') {
    const { ticket, checkIn } = viewState;

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />

        <main className="flex-1 p-6 max-w-lg mx-auto w-full flex flex-col justify-center">
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">🎉</div>
            <h1 className="text-2xl font-bold text-gray-900">{t('checkinSuccess')}</h1>
          </div>

          {/* Success info */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-900 uppercase mb-2">{ticket.recipientName}</h2>
            <p className="text-green-700 text-lg">
              {checkIn.actualTotal} {checkIn.actualTotal === 1 ? t('person') : t('people')}
            </p>
            <p className="text-gray-500 text-sm mt-2">
              {checkIn.actualAdults} {t('adults')} • {checkIn.actualChildren} {t('children')}
            </p>
          </div>

          {/* Scan another button */}
          <Button fullWidth size="lg" onClick={handleScanAnother}>
            {t('scanAnother')}
          </Button>
        </main>
      </div>
    );
  }

  return null;
}
