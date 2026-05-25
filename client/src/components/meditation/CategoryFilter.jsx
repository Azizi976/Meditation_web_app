import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export default function CategoryFilter({ categories, active, onChange }) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => onChange(null)}
        className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all ${
          !active
            ? 'bg-lavender-500 text-white shadow-md shadow-lavender-200'
            : 'glass text-slate-600 hover:bg-white/80'
        }`}
      >
        {t('library.all')}
      </motion.button>
      {categories.map(cat => (
        <motion.button
          key={cat.id}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(cat.slug)}
          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all flex items-center gap-1.5 ${
            active === cat.slug
              ? 'bg-lavender-500 text-white shadow-md shadow-lavender-200'
              : 'glass text-slate-600 hover:bg-white/80'
          }`}
        >
          {cat.icon} {cat.name}
        </motion.button>
      ))}
    </div>
  );
}
