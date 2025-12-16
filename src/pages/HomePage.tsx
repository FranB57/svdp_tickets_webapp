import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useLabels } from '../hooks/useLabels';
import { getStats } from '../services/ticketStorage';

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

function ScanIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" />
    </svg>
  );
}

function UserGroupIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const { t } = useLabels();

  const [stats, setStats] = useState({
    totalTickets: 0,
    checkedIn: 0,
    walkIns: 0,
    totalExpectedGuests: 0,
    totalActualGuests: 0,
    totalWalkInGuests: 0,
  });

  useEffect(() => {
    setStats(getStats());
    // Refresh stats every 30 seconds
    const interval = setInterval(() => setStats(getStats()), 30000);
    return () => clearInterval(interval);
  }, []);

  const totalCheckedInGuests = stats.totalActualGuests + stats.totalWalkInGuests;
  const hasData = stats.totalTickets > 0 || stats.walkIns > 0;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 flex flex-col justify-center p-6 max-w-lg mx-auto w-full">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <button
            onClick={() => navigate('/issue')}
            className="bg-svdp-blue text-white rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-svdp-blue-600 transition-all active:scale-[0.98] shadow-lg"
          >
            <TicketIcon className="w-8 h-8" />
            <span className="font-semibold">{t('issueTicket')}</span>
          </button>

          <button
            onClick={() => navigate('/scan')}
            className="bg-white text-gray-900 rounded-2xl p-6 flex flex-col items-center gap-3 hover:bg-gray-50 transition-all active:scale-[0.98] shadow-lg border border-gray-200"
          >
            <ScanIcon className="w-8 h-8 text-svdp-blue" />
            <span className="font-semibold">{t('scanTicket')}</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/walkin')}
            className="bg-white text-gray-700 rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98] border border-gray-200"
          >
            <UserGroupIcon className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-sm">{t('walkIn')}</span>
          </button>

          <button
            onClick={() => navigate('/history')}
            className="bg-white text-gray-700 rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98] border border-gray-200"
          >
            <ClockIcon className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-sm">{t('history')}</span>
          </button>
        </div>

        {/* Statistics Widget */}
        {hasData && (
          <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="text-xs font-medium text-gray-500 mb-3">{t('statistics')}</h3>

            {/* Progress bar */}
            <div className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">{t('checkedInCount')}</span>
                <span className="font-semibold text-gray-900">
                  {totalCheckedInGuests} / {stats.totalExpectedGuests || totalCheckedInGuests}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{
                    width: `${stats.totalExpectedGuests > 0
                      ? Math.min(100, (totalCheckedInGuests / stats.totalExpectedGuests) * 100)
                      : 100}%`
                  }}
                />
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="font-bold text-gray-900">{stats.totalTickets}</p>
                <p className="text-gray-500">{t('ticketsCreated')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="font-bold text-gray-900">{stats.checkedIn}</p>
                <p className="text-gray-500">{t('ticketsUsed')}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="font-bold text-gray-900">{stats.walkIns}</p>
                <p className="text-gray-500">{t('walkIns')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Status */}
        <div className="flex justify-center mt-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
            {t('connected')}
          </div>
        </div>
      </main>
    </div>
  );
}
