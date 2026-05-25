import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePlayer } from '../../context/PlayerContext';
import { useAuth } from '../../context/AuthContext';
import { formatTime } from '../../utils/formatTime';
import Badge from '../ui/Badge';
import api from '../../services/api';

const CATEGORY_COLORS = {
  sleep:   'lavender',
  anxiety: 'sky',
  focus:   'sage',
  morning: 'sand',
  breath:  'blush',
  body:    'sage',
};

export default function MeditationCard({ meditation, onFavoriteToggle, isFavorite }) {
  const { t }         = useTranslation();
  const { loadTrack } = usePlayer();
  const { user }      = useAuth();

  const color = CATEGORY_COLORS[meditation.category?.slug] || 'lavender';

  async function handleFavorite(e) {
    e.stopPropagation();
    if (!user) return;
    try {
      if (isFavorite) {
        await api.delete(`/user/favorites/${meditation.id}`);
      } else {
        await api.post(`/user/favorites/${meditation.id}`);
      }
      onFavoriteToggle?.(meditation.id, !isFavorite);
    } catch {}
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      onClick={() => loadTrack(meditation)}
      className="glass rounded-3xl overflow-hidden cursor-pointer group relative"
    >
      {/* Thumbnail / color block */}
      <div className={`h-40 flex items-center justify-center relative overflow-hidden
        bg-gradient-to-br ${
          color === 'lavender' ? 'from-lavender-100 to-lavender-200' :
          color === 'sky'      ? 'from-sky-100 to-sky-200'           :
          color === 'sage'     ? 'from-sage-100 to-sage-200'         :
          color === 'sand'     ? 'from-sand-100 to-sand-200'         :
          color === 'blush'    ? 'from-blush-100 to-blush-200'       :
                                 'from-lavender-100 to-lavender-200'
        }`}
      >
        <span className="text-5xl group-hover:animate-float transition-all">
          {meditation.category?.icon || '🧘'}
        </span>

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all shadow-lg">
            <svg className="w-5 h-5 text-lavender-600 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </div>

        {/* Favorite button */}
        {user && (
          <button
            onClick={handleFavorite}
            className="absolute top-3 end-3 w-8 h-8 rounded-full bg-white/80 hover:bg-white flex items-center justify-center transition-all shadow"
          >
            <svg
              className={`w-4 h-4 transition-colors ${isFavorite ? 'text-blush-500 fill-blush-500' : 'text-slate-400'}`}
              fill={isFavorite ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-slate-700 leading-tight line-clamp-2 text-sm">
            {meditation.title}
          </h3>
          <Badge color={color} className="shrink-0">
            {Math.round(meditation.durationSeconds / 60)}{t('common.min')}
          </Badge>
        </div>
        <p className="text-xs text-slate-400 mb-2 line-clamp-2">{meditation.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">{meditation.instructor}</span>
          {meditation.category && (
            <Badge color={color}>{meditation.category.icon} {meditation.category.name}</Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
}
