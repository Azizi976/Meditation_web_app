import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import api from '../services/api';
import MeditationCard from '../components/meditation/MeditationCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const TABS = ['favorites', 'history', 'settings'];

export default function Profile() {
  const { t }                  = useTranslation();
  const { user, logout }       = useAuth();
  const { lang, switchLanguage } = useLocale();
  const [tab, setTab]          = useState('favorites');

  if (!user) return <Navigate to="/login" replace />;

  const { data: favData, isLoading: favLoading } = useQuery({
    queryKey: ['favorites', user.id, lang],
    queryFn:  () => api.get(`/user/favorites?lang=${lang}`).then(r => r.data.meditations),
    enabled:  tab === 'favorites',
  });

  const { data: progressData, isLoading: progLoading } = useQuery({
    queryKey: ['progress', user.id, lang],
    queryFn:  () => api.get(`/user/progress?lang=${lang}`).then(r => r.data.progress),
    enabled:  tab === 'history',
  });

  return (
    <div className="space-y-8 pb-32">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="glass-strong rounded-3xl p-6 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-lavender-300 to-sky-300 flex items-center justify-center text-2xl shadow-lg">
            {user.displayName?.[0]?.toUpperCase() || '🧘'}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-700">{user.displayName || user.email}</h1>
            <p className="text-sm text-slate-400">{user.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={logout} className="ms-auto">
            {t('nav.logout')}
          </Button>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-1 glass rounded-2xl p-1">
        {TABS.map(tabId => (
          <button
            key={tabId}
            onClick={() => setTab(tabId)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === tabId
                ? 'bg-white text-lavender-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t(`profile.${tabId}`)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'favorites' && (
        favLoading ? <Spinner className="py-12" /> :
        !favData?.length ? (
          <p className="text-center text-slate-400 py-16">{t('profile.no_favorites')}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {favData.map(m => <MeditationCard key={m.id} meditation={m} isFavorite />)}
          </div>
        )
      )}

      {tab === 'history' && (
        progLoading ? <Spinner className="py-12" /> :
        !progressData?.length ? (
          <p className="text-center text-slate-400 py-16">{t('profile.no_history')}</p>
        ) : (
          <div className="space-y-3">
            {progressData.map(p => (
              <div key={p.meditationId} className="glass rounded-2xl p-4 flex items-center gap-4">
                <span className="text-2xl">{p.meditation.category?.icon || '🧘'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">{p.meditation.title}</p>
                  <p className="text-xs text-slate-400">
                    {Math.round(p.lastPositionSeconds / 60)} / {Math.round(p.meditation.durationSeconds / 60)} {t('common.min')}
                  </p>
                </div>
                {p.completed && <span className="text-xs bg-sage-100 text-sage-700 px-2 py-1 rounded-full">✓</span>}
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'settings' && (
        <div className="glass-strong rounded-3xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-3">{t('profile.language')}</h3>
            <div className="flex gap-2">
              {['en', 'he'].map(l => (
                <button
                  key={l}
                  onClick={() => switchLanguage(l)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                    lang === l
                      ? 'bg-lavender-500 text-white shadow-md shadow-lavender-200'
                      : 'glass text-slate-600 hover:bg-white/80'
                  }`}
                >
                  {l === 'en' ? '🇺🇸 English' : '🇮🇱 עברית'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
