import { useRef, useCallback, useEffect } from 'react';

export function useAudioEngine() {
  const ctxRef        = useRef(null);
  const voiceElRef    = useRef(null);
  const ambientElRef  = useRef(null);
  const voiceSrcRef   = useRef(null);
  const ambientSrcRef = useRef(null);
  const voiceGainRef  = useRef(null);
  const ambientGainRef= useRef(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const attachVoice = useCallback((el) => {
    if (!el || voiceElRef.current === el) return;
    voiceElRef.current = el;

    const ctx = getCtx();
    if (voiceSrcRef.current) voiceSrcRef.current.disconnect();

    voiceSrcRef.current  = ctx.createMediaElementSource(el);
    voiceGainRef.current = ctx.createGain();
    voiceGainRef.current.gain.value = 1.0;

    voiceSrcRef.current.connect(voiceGainRef.current);
    voiceGainRef.current.connect(ctx.destination);
  }, [getCtx]);

  const attachAmbient = useCallback((el) => {
    if (!el || ambientElRef.current === el) return;
    ambientElRef.current = el;

    const ctx = getCtx();
    if (ambientSrcRef.current) ambientSrcRef.current.disconnect();

    ambientSrcRef.current  = ctx.createMediaElementSource(el);
    ambientGainRef.current = ctx.createGain();
    ambientGainRef.current.gain.value = 0.4;

    ambientSrcRef.current.connect(ambientGainRef.current);
    ambientGainRef.current.connect(ctx.destination);
  }, [getCtx]);

  const setVoiceVolume = useCallback((value) => {
    const ctx = getCtx();
    if (voiceGainRef.current) {
      voiceGainRef.current.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, value)),
        ctx.currentTime + 0.05
      );
    }
  }, [getCtx]);

  const setAmbientVolume = useCallback((value) => {
    const ctx = getCtx();
    if (ambientGainRef.current) {
      ambientGainRef.current.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, value)),
        ctx.currentTime + 0.05
      );
    }
  }, [getCtx]);

  // Smooth crossfade to a new ambient element
  const crossfadeAmbient = useCallback((newEl, durationSec = 1.2) => {
    if (!newEl) return;
    const ctx     = getCtx();
    const now     = ctx.currentTime;
    const current = ambientGainRef.current?.gain.value ?? 0.4;

    if (ambientGainRef.current) {
      ambientGainRef.current.gain.linearRampToValueAtTime(0, now + durationSec);
    }

    setTimeout(() => {
      attachAmbient(newEl);
      const newCtxNow = ctx.currentTime;
      ambientGainRef.current.gain.setValueAtTime(0, newCtxNow);
      ambientGainRef.current.gain.linearRampToValueAtTime(current, newCtxNow + durationSec);
      newEl.play().catch(() => {});
    }, durationSec * 1000);
  }, [getCtx, attachAmbient]);

  const resumeContext = useCallback(() => {
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume();
    }
  }, []);

  useEffect(() => {
    return () => { ctxRef.current?.close(); };
  }, []);

  return { attachVoice, attachAmbient, setVoiceVolume, setAmbientVolume, crossfadeAmbient, resumeContext };
}
