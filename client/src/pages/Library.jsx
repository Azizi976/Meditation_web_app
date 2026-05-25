import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useLocale } from '../context/LocaleContext';
import { useAuth } from '../context/AuthContext';
import { getMeditations, getCategories } from '../services/meditationService';
import api from '../services/api';
import MeditationCard from '../components/meditation/MeditationCard';
import CategoryFilter from '../components/meditation/CategoryFilter';
import Spinner from '../components/ui/Spinner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item      = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function Library() {
  const { t }    = useTranslation();
  const { lang } = useLocale();
  const { user } = useAuth();
  const [params] = useSearchParams();

  const [category, setCategory] = useState(params.get('category') || null);
  const [search,   setSearch]   = useState('');
  const [favorites, setFavorites] = useState(new Set());

  const { data: meditationsData, isLoading } = useQuery({
    queryKey: ['meditations', lang, category],
    queryFn:  () => getMeditations({ lang, ...(category ? { category } : {}), limit: 50 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', lang],
    queryFn:  () => getCategories(lang),
  });

  const { data: favsData } = useQuery({
    queryKey: ['favorites', user?.id],
    queryFn:  () => api.get('/user/favorites').then(r => r.data.meditations),
    enabled:  !!user,
    onSuccess: data => setFavorites(new Set(data.map(m => m.id))),
  });

  const meditations = useMemo(() => {
    const all = meditationsData?.meditations || [];
    if (!search.trim()) return all;
    const q = search.toLowerCase();
    return all.filter(m =>
      m.title?.toLowerCase().includes(q) ||
      m.instructor?.toLowerCase().includes(q) ||
      m.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }, [meditationsData, search]);

  function handleFavoriteToggle(id, isFav) {
    setFavorites(prev => {
      const next = new Set(prev);
      isFav ? next.add(id) : next.delete(id);
      return next;
    });
  }

  return (
    <div className="space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-semibold text-slate-700 mb-2">{t('library.title')}</h1>
      </motion.div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t('library.search_placeholder')}
          className="w-full ps-11 pe-4 py-3 glass rounded-2xl text-sm text-slate-700 placeholder-slate-400 outline-none focus:ring-2 focus:ring-lavender-300"
        />
      </div>

      {/* Category filter */}
      <CategoryFilter
        categories={categories || []}
        active={category}
        onChange={setCategory}
      />

      {/* Grid */}
      {isLoading ? (
        <Spinner className="py-20" />
      ) : meditations.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <span className="text-4xl block mb-3">🔍</span>
          <p className="text-sm">{t('common.error')}</p>
        </div>
      ) : (
        <motion.div
          key={`${category}-${search}`}
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {meditations.map(m => (
            <motion.div key={m.id} variants={item}>
              <MeditationCard
                meditation={m}
                isFavorite={favorites.has(m.id)}
                onFavoriteToggle={handleFavoriteToggle}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
