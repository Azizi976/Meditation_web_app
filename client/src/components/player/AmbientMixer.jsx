import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../../context/LocaleContext';
import { usePlayer } from '../../context/PlayerContext';
import { getAmbientSounds } from '../../services/ambientService';

export default function AmbientMixer({ ambientVolume, onVolumeChange }) {
  const { t }        = useTranslation();
  const { lang }     = useLocale();
  const { selectedAmbient, setAmbient } = usePlayer();
  const [open, setOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['ambient', lang],
    queryFn: () => getAmbientSounds(lang),
  });

  const sounds = data || [];

  return (
    <div className="relative flex items-center gap-2">
      {/* Ambient icon button */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
          selectedAmbient
            ? 'bg-sage-100 text-sage-700'
            : 'bg-white/50 text-slate-500 hover:bg-white'
        }`}
      >
        <span>{selectedAmbient ? selectedAmbient.icon : '🎵'}</span>
        <span className="hidden md:block">{selectedAmbient ? selectedAmbient.name : t('player.ambient_label')}</span>
      </button>

      {/* Ambient volume */}
      {selectedAmbient && (
        <input
          type="range" min={0} max={1} step={0.01}
          value={ambientVolume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          className="slider-thumb w-20"
          style={{ '--progress': `${ambientVolume * 100}%` }}
          title={t('player.ambient_volume')}
        />
      )}

      {/* Sound picker dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute bottom-full mb-2 end-0 glass-strong rounded-2xl shadow-xl p-2 w-44 z-10"
          >
            <button
              onClick={() => { setAmbient(null); setOpen(false); }}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                !selectedAmbient ? 'bg-lavender-100 text-lavender-700' : 'hover:bg-white/60 text-slate-600'
              }`}
            >
              <span>🔇</span> {t('player.none')}
            </button>
            {sounds.map(s => (
              <button
                key={s.id}
                onClick={() => { setAmbient(s); setOpen(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all ${
                  selectedAmbient?.id === s.id
                    ? 'bg-sage-100 text-sage-700'
                    : 'hover:bg-white/60 text-slate-600'
                }`}
              >
                <span>{s.icon}</span> {s.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
