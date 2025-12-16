import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { useLabels } from '../hooks/useLabels';
import { useAuth } from '../hooks/useAuth';
import { getActivityHistory, type ActivityItem } from '../services/ticketStorage';
import type { LabelKey } from '../i18n/labels';

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
  );
}

function TicketIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
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

function formatTimeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
}

function ActivityCard({ activity, t }: { activity: ActivityItem; t: (key: LabelKey) => string }) {
  const getIcon = () => {
    switch (activity.type) {
      case 'ticket':
        return <TicketIcon className="w-5 h-5" />;
      case 'checkin':
        return <CheckIcon className="w-5 h-5" />;
      case 'walkin':
        return <UserGroupIcon className="w-5 h-5" />;
    }
  };

  const getLabel = () => {
    switch (activity.type) {
      case 'ticket':
        return t('ticketIssued');
      case 'checkin':
        return t('checkedInEntry');
      case 'walkin':
        return t('walkInEntry');
    }
  };

  const getBgColor = () => {
    switch (activity.type) {
      case 'ticket':
        return 'bg-blue-50 text-blue-600';
      case 'checkin':
        return 'bg-green-50 text-green-600';
      case 'walkin':
        return 'bg-purple-50 text-purple-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getBgColor()}`}>
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{activity.name}</p>
          <p className="text-sm text-gray-500">
            {getLabel()} • {activity.count} {activity.count === 1 ? t('person') : t('people')}
          </p>
        </div>
        <div className="text-xs text-gray-400 whitespace-nowrap">
          {formatTimeAgo(activity.timestamp)}
        </div>
      </div>
    </div>
  );
}

export function HistoryPage() {
  const navigate = useNavigate();
  const { t } = useLabels();
  const { session } = useAuth();

  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    // Load data
    const volunteerName = showAllActivities ? undefined : session?.volunteerName;
    setActivities(getActivityHistory(volunteerName));
  }, [session?.volunteerName, showAllActivities]);

  const myTickets = activities.filter((a) => a.type === 'ticket' && a.volunteerName === session?.volunteerName).length;
  const myCheckIns = activities.filter((a) => a.type === 'checkin' && a.volunteerName === session?.volunteerName).length;
  const myWalkIns = activities.filter((a) => a.type === 'walkin' && a.volunteerName === session?.volunteerName).length;

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

        <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('history')}</h1>

        {/* Summary Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <h2 className="text-sm font-medium text-gray-500 mb-3">{t('summary')}</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                <TicketIcon className="w-4 h-4" />
                <span className="text-xl font-bold">{myTickets}</span>
              </div>
              <p className="text-xs text-gray-500">{t('ticketsIssued')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                <CheckIcon className="w-4 h-4" />
                <span className="text-xl font-bold">{myCheckIns}</span>
              </div>
              <p className="text-xs text-gray-500">{t('checkIns')}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
                <UserGroupIcon className="w-4 h-4" />
                <span className="text-xl font-bold">{myWalkIns}</span>
              </div>
              <p className="text-xs text-gray-500">{t('walkIns')}</p>
            </div>
          </div>
        </div>

        {/* Filter toggle */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-gray-700">{t('recentActivity')}</h2>
          <button
            onClick={() => setShowAllActivities(!showAllActivities)}
            className="text-xs text-svdp-blue hover:text-svdp-blue-600"
          >
            {showAllActivities ? 'Show mine' : 'Show all'}
          </button>
        </div>

        {/* Activity List */}
        {activities.length > 0 ? (
          <div className="space-y-2">
            {activities.slice(0, 20).map((activity) => (
              <ActivityCard key={`${activity.type}-${activity.id}`} activity={activity} t={t} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <p className="text-gray-500">{t('noActivity')}</p>
          </div>
        )}
      </main>
    </div>
  );
}
