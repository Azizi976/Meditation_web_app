import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useLocale } from '../context/LocaleContext';
import { getMeditations, getCategories } from '../services/meditationService';
import MeditationCard from '../components/meditation/MeditationCard';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item      = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Home() {
  const { t }    = useTranslation();
  const { lang } = useLocale();

  const { data: meditationsData, isLoading } = useQuery({
    queryKey: ['meditations', 'featured', lang],
    queryFn: () => getMeditations({ lang, limit: 6 }),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories', lang],
    queryFn:  () => getCategories(lang),
  });

  const meditations = meditationsData?.meditations || [];
  const cats        = categories || [];

  return (
    <div className="space-y-16 pb-32">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="text-center pt-8 pb-4"
      >
        {/* Breathing orb */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-lavender-300 to-sky-300 animate-breathe opacity-60" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-lavender-400 to-sky-400 animate-breathe opacity-80 flex items-center justify-center">
              <span className="text-4xl">🧘</span>
            </div>
          </div>
        </div>

        <h1 className="text-4xl sm:text-6xl font-display font-semibold text-slate-700 mb-3 leading-tight">
          {t('home.hero_title')}{' '}
          <span className="text-gradient">{t('home.hero_highlight')}</span>
        </h1>
        <p className="text-lg text-slate-500 mb-8 max-w-md mx-auto">{t('home.hero_subtitle')}</p>
        <Link to="/library">
          <Button size="lg">{t('home.cta')}</Button>
        </Link>
      </motion.section>

      {/* Categories */}
      {cats.length > 0 && (
        <section>
          <motion.h2
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-xl font-semibold text-slate-700 mb-5"
          >
            {t('home.categories')}
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cats.map(cat => (
              <Link key={cat.id} to={`/library?category=${cat.slug}`}>
                <motion.div
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass rounded-2xl p-4 text-center cursor-pointer group"
                >
                  <div className="text-3xl mb-2 group-hover:animate-float">{cat.icon}</div>
                  <p className="text-xs font-medium text-slate-600">{cat.name}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured meditations */}
      <section>
        <motion.h2
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="text-xl font-semibold text-slate-700 mb-5"
        >
          {t('home.featured')}
        </motion.h2>
        {isLoading ? (
          <Spinner className="py-16" />
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {meditations.map(m => (
              <motion.div key={m.id} variants={item}>
                <MeditationCard meditation={m} />
              </motion.div>
            ))}
          </motion.div>
        )}
        <div className="text-center mt-8">
          <Link to="/library">
            <Button variant="secondary">{t('home.cta')}</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
