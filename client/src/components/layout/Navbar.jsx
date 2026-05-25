import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import Button from '../ui/Button';

export default function Navbar() {
  const { t }               = useTranslation();
  const { user, logout }    = useAuth();
  const { lang, switchLanguage } = useLocale();
  const location            = useLocation();

  const links = [
    { to: '/',        label: t('nav.home')    },
    { to: '/library', label: t('nav.library') },
    ...(user ? [{ to: '/profile', label: t('nav.profile') }] : []),
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0,   opacity: 1  }}
      className="sticky top-0 z-50 glass-strong border-b border-white/40"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-2xl group-hover:animate-breathe transition-all">🧘</span>
          <span className="font-display font-semibold text-slate-700 hidden sm:block">
            {t('app.name')}
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                location.pathname === l.to
                  ? 'bg-lavender-100 text-lavender-700'
                  : 'text-slate-600 hover:bg-white/50'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <button
            onClick={() => switchLanguage(lang === 'en' ? 'he' : 'en')}
            className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/50 hover:bg-white text-slate-600 transition-all border border-white/60"
          >
            {lang === 'en' ? 'עב' : 'EN'}
          </button>

          {user ? (
            <Button variant="ghost" size="sm" onClick={logout}>
              {t('nav.logout')}
            </Button>
          ) : (
            <Button variant="primary" size="sm" as={Link} onClick={() => {}}>
              <Link to="/login" className="text-white no-underline">{t('nav.login')}</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
