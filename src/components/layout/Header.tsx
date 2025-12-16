import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';
import { useLabels } from '../../hooks/useLabels';
import { getSyncStatus, processSyncQueue } from '../../services/googleSheets';

export function Header() {
  const { session, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { t } = useLabels();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [syncStatus, setSyncStatus] = useState(getSyncStatus());

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update sync status periodically and process queue
  useEffect(() => {
    const updateStatus = () => setSyncStatus(getSyncStatus());
    updateStatus();

    // Process sync queue every 30 seconds if there are pending items
    const interval = setInterval(() => {
      const status = getSyncStatus();
      setSyncStatus(status);
      if (status.pending > 0 && status.configured) {
        processSyncQueue().then(() => setSyncStatus(getSyncStatus()));
      }
    }, 30000);

    // Also listen for storage events to update status when data changes
    window.addEventListener('storage', updateStatus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', updateStatus);
    };
  }, []);

  return (
    <header className="bg-svdp-blue text-white shadow-md">
      <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">SVDP Event Tracker</h1>
            {syncStatus.configured && (
              <span
                className={`w-2 h-2 rounded-full ${
                  syncStatus.pending > 0 ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'
                }`}
                title={
                  syncStatus.pending > 0
                    ? `${syncStatus.pending} pending sync`
                    : 'Google Sheets connected'
                }
              />
            )}
          </div>
          {session && (
            <p className="text-svdp-blue-100 text-sm">
              {t('welcome')}, {session.volunteerName}
            </p>
          )}
        </div>

        {session && (
          <div className="relative" ref={menuRef}>
            {/* Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-svdp-blue-600 transition-colors"
              aria-label={t('settings')}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg py-2 z-50 text-gray-900">
                {/* Language Toggle */}
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
                    {t('language')}
                  </p>
                  <div className="flex rounded-lg bg-gray-100 p-1">
                    <button
                      onClick={() => setLanguage('es')}
                      className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                        language === 'es'
                          ? 'bg-white text-svdp-blue shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Español
                    </button>
                    <button
                      onClick={() => setLanguage('en')}
                      className={`flex-1 py-1.5 px-3 rounded-md text-sm font-medium transition-colors ${
                        language === 'en'
                          ? 'bg-white text-svdp-blue shadow'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      English
                    </button>
                  </div>
                </div>

                {/* Switch User */}
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  {t('switchUser')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
