import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

export default function Login() {
  const { t }        = useTranslation();
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0  }}
        className="glass-strong rounded-3xl p-8 w-full max-w-md shadow-xl"
      >
        <div className="text-center mb-8">
          <span className="text-4xl block mb-3">🧘</span>
          <h1 className="text-2xl font-display font-semibold text-slate-700">{t('auth.login_title')}</h1>
          <p className="text-sm text-slate-500 mt-1">{t('auth.login_subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('auth.email')}</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/60 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-lavender-300 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">{t('auth.password')}</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-3 rounded-2xl bg-white/60 border border-white/60 text-slate-700 text-sm outline-none focus:ring-2 focus:ring-lavender-300 transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-blush-500 text-center">
              {error}
            </motion.p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? t('common.loading') : t('auth.sign_in')}
          </Button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          {t('auth.no_account')}{' '}
          <Link to="/register" className="text-lavender-600 font-medium hover:underline">
            {t('auth.sign_up')}
          </Link>
        </p>

        <p className="text-center text-xs text-slate-400 mt-4 bg-slate-50/50 rounded-xl p-2">
          {t('auth.demo_hint')}
        </p>
      </motion.div>
    </div>
  );
}
