import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePlayer } from '../../context/PlayerContext';
import { useAudioEngine } from '../../hooks/useAudioEngine';
import { formatTime } from '../../utils/formatTime';
import AmbientMixer from './AmbientMixer';

export default function PersistentPlayer() {
  const { t } = useTranslation();
  const {
    track, isPlaying, currentTime, duration,
    voiceVolume, ambientVolume, selectedAmbient,
    togglePlay, seek, setVoiceVol, setAmbientVol,
    updateTime, setDuration,
  } = usePlayer();

  const voiceRef   = useRef(null);
  const ambientRef = useRef(null);
  const { attachVoice, attachAmbient, setVoiceVolume, setAmbientVolume, resumeContext } = useAudioEngine();

  // Attach elements to Web Audio graph once
  useEffect(() => {
    if (voiceRef.current)   attachVoice(voiceRef.current);
    if (ambientRef.current) attachAmbient(ambientRef.current);
  }, []);

  // Sync play/pause state
  useEffect(() => {
    if (!voiceRef.current) return;
    resumeContext();
    if (isPlaying) {
      voiceRef.current.play().catch(() => {});
      ambientRef.current?.play().catch(() => {});
    } else {
      voiceRef.current.pause();
      ambientRef.current?.pause();
    }
  }, [isPlaying]);

  // Load new track
  useEffect(() => {
    if (!track || !voiceRef.current) return;
    voiceRef.current.src = track.audioUrl || '';
    voiceRef.current.load();
    if (isPlaying) voiceRef.current.play().catch(() => {});
  }, [track?.id]);

  // Sync ambient track source
  useEffect(() => {
    if (!ambientRef.current) return;
    ambientRef.current.src = selectedAmbient?.audioUrl || '';
    if (selectedAmbient?.audioUrl) {
      ambientRef.current.load();
      if (isPlaying) ambientRef.current.play().catch(() => {});
    }
  }, [selectedAmbient?.id]);

  // Volume sync
  useEffect(() => { setVoiceVolume(voiceVolume);   }, [voiceVolume]);
  useEffect(() => { setAmbientVolume(ambientVolume); }, [ambientVolume]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!track) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0,   opacity: 1  }}
        exit={{ y: 120, opacity: 0 }}
        className="fixed bottom-0 inset-x-0 z-50 glass-strong border-t border-white/40 shadow-2xl"
      >
        {/* Hidden audio elements managed by Web Audio API */}
        <audio
          ref={voiceRef}
          onTimeUpdate={e  => updateTime(e.target.currentTime)}
          onLoadedMetadata={e => setDuration(e.target.duration)}
          onEnded={() => {}}
          preload="metadata"
        />
        <audio ref={ambientRef} loop preload="auto" />

        {/* Progress bar */}
        <div
          className="h-1 bg-white/30 cursor-pointer"
          onClick={e => {
            const rect = e.currentTarget.getBoundingClientRect();
            const pct  = (e.clientX - rect.left) / rect.width;
            const time = pct * duration;
            seek(time);
            if (voiceRef.current) voiceRef.current.currentTime = time;
          }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-lavender-400 to-sky-400"
            style={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          {/* Track info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-400 truncate">{t('player.now_playing')}</p>
            <p className="text-sm font-medium text-slate-700 truncate">{track.title}</p>
            <p className="text-xs text-slate-400 truncate">{track.instructor}</p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 tabular-nums">{formatTime(currentTime)}</span>
            <button
              onClick={() => { resumeContext(); togglePlay(); }}
              className="w-12 h-12 rounded-full bg-lavender-500 hover:bg-lavender-600 text-white flex items-center justify-center shadow-lg shadow-lavender-200 transition-all active:scale-95"
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              )}
            </button>
            <span className="text-xs text-slate-400 tabular-nums">{formatTime(duration)}</span>
          </div>

          {/* Volume + Ambient mixer */}
          <div className="hidden sm:flex items-center gap-4 flex-1 justify-end">
            {/* Voice volume */}
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12M3 10v4a1 1 0 001 1h3l5 5V4L7 9H4a1 1 0 00-1 1z"/>
              </svg>
              <input
                type="range" min={0} max={1} step={0.01}
                value={voiceVolume}
                onChange={e => setVoiceVol(parseFloat(e.target.value))}
                className="slider-thumb w-20"
                style={{ '--progress': `${voiceVolume * 100}%` }}
              />
            </div>

            <AmbientMixer
              ambientVolume={ambientVolume}
              onVolumeChange={setAmbientVol}
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
