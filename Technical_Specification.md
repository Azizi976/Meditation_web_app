  ---
  Calm & Reflect — Technical Specification

  1. Folder Structure

  calm-reflect/
  ├── client/                             # React Frontend (Vite)
  │   ├── public/
  │   │   └── assets/
  │   │       ├── audio/
  │   │       │   ├── meditations/        # Voice-guided tracks (.mp3)
  │   │       │   └── ambient/            # Looping ambient layers (.mp3)
  │   │       └── images/
  │   └── src/
  │       ├── components/
  │       │   ├── ui/                     # Atomic, reusable primitives
  │       │   │   ├── Button.jsx
  │       │   │   ├── Slider.jsx          # Volume + progress sliders
  │       │   │   ├── Modal.jsx
  │       │   │   └── Badge.jsx
  │       │   ├── layout/
  │       │   │   ├── AppShell.jsx        # RTL-aware wrapper
  │       │   │   ├── Navbar.jsx
  │       │   │   └── Sidebar.jsx
  │       │   ├── auth/
  │       │   │   ├── LoginForm.jsx
  │       │   │   └── RegisterForm.jsx
  │       │   ├── player/
  │       │   │   ├── AudioPlayer.jsx     # Main playback controls
  │       │   │   ├── AmbientMixer.jsx    # Ambient selector + volume knob
  │       │   │   └── WaveformBar.jsx     # Animated visual indicator
  │       │   └── meditation/
  │       │       ├── MeditationCard.jsx
  │       │       ├── MeditationGrid.jsx
  │       │       └── CategoryFilter.jsx
  │       ├── hooks/
  │       │   ├── useAudioEngine.js       # Dual-layer Web Audio API core
  │       │   ├── useAuth.js              # Auth state + token refresh
  │       │   ├── useMediaSession.js      # Browser OS media controls
  │       │   └── useLocale.js            # RTL detection + i18n helpers
  │       ├── context/
  │       │   ├── AuthContext.jsx
  │       │   ├── PlayerContext.jsx       # Global player state
  │       │   └── LocaleContext.jsx       # Language + direction (ltr/rtl)
  │       ├── services/
  │       │   ├── api.js                  # Axios instance, interceptors, refresh
  │       │   ├── authService.js
  │       │   ├── meditationService.js
  │       │   └── ambientService.js
  │       ├── pages/
  │       │   ├── Home.jsx
  │       │   ├── Library.jsx
  │       │   ├── Player.jsx
  │       │   ├── Login.jsx
  │       │   └── Profile.jsx
  │       ├── i18n/
  │       │   ├── en.json
  │       │   ├── he.json                 # All UI strings in Hebrew
  │       │   └── index.js               # i18next configuration
  │       └── utils/
  │           ├── formatTime.js
  │           └── cn.js                  # Tailwind class merging (clsx + twMerge)
  │
  └── server/                             # Node.js / Express Backend
      └── src/
          ├── config/
          │   ├── db.js                   # Knex / Prisma connection
          │   └── env.js                  # Validated env vars (zod)
          ├── controllers/
          │   ├── authController.js
          │   ├── meditationController.js
          │   └── ambientController.js
          ├── middleware/
          │   ├── authenticate.js         # JWT verification
          │   ├── rateLimiter.js          # express-rate-limit
          │   └── errorHandler.js
          ├── models/                     # DB query functions (or Prisma models)
          │   ├── User.js
          │   ├── Meditation.js
          │   ├── AmbientSound.js
          │   └── UserProgress.js
          ├── routes/
          │   ├── auth.js
          │   ├── meditations.js
          │   ├── ambient.js
          │   └── user.js
          └── app.js

  ---
  2. Database Schema (PostgreSQL)

  -- Users
  CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name  TEXT,
    language      TEXT NOT NULL DEFAULT 'en',   -- 'en' | 'he'
    created_at    TIMESTAMPTZ DEFAULT now(),
    updated_at    TIMESTAMPTZ DEFAULT now()
  );

  -- Sessions (rolling refresh token rotation)
  CREATE TABLE sessions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID REFERENCES users(id) ON DELETE CASCADE,
    refresh_token TEXT UNIQUE NOT NULL,
    expires_at    TIMESTAMPTZ NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT now()
  );

  -- Categories (bilingual)
  CREATE TABLE categories (
    id       SERIAL PRIMARY KEY,
    slug     TEXT UNIQUE NOT NULL,   -- 'sleep', 'anxiety', 'focus'
    name_en  TEXT NOT NULL,
    name_he  TEXT NOT NULL,
    icon     TEXT                    -- icon name / emoji
  );

  -- Meditations (bilingual metadata, audio served via CDN URL)
  CREATE TABLE meditations (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id      INT REFERENCES categories(id),
    title_en         TEXT NOT NULL,
    title_he         TEXT NOT NULL,
    description_en   TEXT,
    description_he   TEXT,
    instructor       TEXT,
    duration_seconds INT NOT NULL,
    audio_url        TEXT NOT NULL,  -- CDN path
    thumbnail_url    TEXT,
    tags             TEXT[],         -- ['breathing', 'body-scan']
    is_published     BOOLEAN DEFAULT true,
    created_at       TIMESTAMPTZ DEFAULT now()
  );

  -- Ambient Sounds
  CREATE TABLE ambient_sounds (
    id        SERIAL PRIMARY KEY,
    name_en   TEXT NOT NULL,
    name_he   TEXT NOT NULL,
    audio_url TEXT NOT NULL,         -- loopable CDN path
    icon      TEXT
  );

  -- User listening history + resume position
  CREATE TABLE user_progress (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID REFERENCES users(id) ON DELETE CASCADE,
    meditation_id         UUID REFERENCES meditations(id),
    last_position_seconds INT DEFAULT 0,
    completed             BOOLEAN DEFAULT false,
    listened_at           TIMESTAMPTZ DEFAULT now(),
    UNIQUE (user_id, meditation_id)
  );

  -- User favorites
  CREATE TABLE user_favorites (
    user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    meditation_id UUID REFERENCES meditations(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (user_id, meditation_id)
  );

  -- Persisted per-user mixer state
  CREATE TABLE user_preferences (
    user_id           UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    ambient_sound_id  INT REFERENCES ambient_sounds(id),
    voice_volume      REAL DEFAULT 1.0,   -- 0.0 – 1.0
    ambient_volume    REAL DEFAULT 0.4
  );

  ---
  3. API Endpoints

  Auth  POST /api/auth/*

  ┌────────┬───────────┬────────────────────────────────────────────┬─────────────────────────────────────────────────┬─────────────────┐
  │ Method │   Path    │                    Body                    │                    Response                     │      Auth       │
  ├────────┼───────────┼────────────────────────────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
  │ POST   │ /register │ { email, password, displayName, language } │ { user, accessToken } + HttpOnly refresh cookie │ —               │
  ├────────┼───────────┼────────────────────────────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
  │ POST   │ /login    │ { email, password }                        │ { user, accessToken } + HttpOnly refresh cookie │ —               │
  ├────────┼───────────┼────────────────────────────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
  │ POST   │ /logout   │ —                                          │ 204                                             │ Cookie          │
  ├────────┼───────────┼────────────────────────────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
  │ POST   │ /refresh  │ —                                          │ { accessToken }                                 │ HttpOnly cookie │
  ├────────┼───────────┼────────────────────────────────────────────┼─────────────────────────────────────────────────┼─────────────────┤
  │ GET    │ /me       │ —                                          │ { user }                                        │ Bearer          │
  └────────┴───────────┴────────────────────────────────────────────┴─────────────────────────────────────────────────┴─────────────────┘

  ▎ Access tokens are short-lived (15 min). Refresh tokens rotate on every /refresh call and are stored HttpOnly — this prevents XSS token theft.

  Meditations  GET /api/meditations/*

  ┌────────┬─────────────┬───────────────────────────────────────────┬──────────┐
  │ Method │    Path     │               Query params                │   Auth   │
  ├────────┼─────────────┼───────────────────────────────────────────┼──────────┤
  │ GET    │ /           │ ?category=sleep&lang=he&limit=20&offset=0 │ Optional │
  ├────────┼─────────────┼───────────────────────────────────────────┼──────────┤
  │ GET    │ /:id        │ —                                         │ Optional │
  ├────────┼─────────────┼───────────────────────────────────────────┼──────────┤
  │ GET    │ /categories │ ?lang=he                                  │ —        │
  └────────┴─────────────┴───────────────────────────────────────────┴──────────┘

  Ambient Sounds  GET /api/ambient

  ┌────────┬──────┬──────┐
  │ Method │ Path │ Auth │
  ├────────┼──────┼──────┤
  │ GET    │ /    │ —    │
  └────────┴──────┴──────┘

  User  *  /api/user/*  (all require Bearer)

  ┌──────────┬──────────────────────────┬────────────────────────────────────────────────┐
  │  Method  │           Path           │                     Notes                      │
  ├──────────┼──────────────────────────┼────────────────────────────────────────────────┤
  │ GET      │ /favorites               │                                                │
  ├──────────┼──────────────────────────┼────────────────────────────────────────────────┤
  │ POST     │ /favorites/:meditationId │                                                │
  ├──────────┼──────────────────────────┼────────────────────────────────────────────────┤
  │ DELETE   │ /favorites/:meditationId │                                                │
  ├──────────┼──────────────────────────┼────────────────────────────────────────────────┤
  │ GET      │ /progress                │ Resume position for all started tracks         │
  ├──────────┼──────────────────────────┼────────────────────────────────────────────────┤
  │ POST/PUT │ /progress/:meditationId  │ { lastPosition, completed }                    │
  ├──────────┼──────────────────────────┼────────────────────────────────────────────────┤
  │ GET      │ /preferences             │ Mixer state                                    │
  ├──────────┼──────────────────────────┼────────────────────────────────────────────────┤
  │ PUT      │ /preferences             │ { ambientSoundId, voiceVolume, ambientVolume } │
  └──────────┴──────────────────────────┴────────────────────────────────────────────────┘

  ---
  4. Dual-Layer Audio Engine

  Why Web Audio API over two <audio> elements

  ┌────────────────────────────┬─────────────────────────────────┬───────────────────────────────────────────┐
  │          Concern           │      Two <audio> elements       │               Web Audio API               │
  ├────────────────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
  │ Volume control             │ Only element.volume (coarse)    │ GainNode — smooth, click-free ramping     │
  ├────────────────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
  │ Crossfade between ambients │ Manual, complex                 │ gain.linearRampToValueAtTime()            │
  ├────────────────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
  │ Future FX (reverb, EQ)     │ Impossible                      │ Drop in ConvolverNode / BiquadFilterNode  │
  ├────────────────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
  │ Sync guarantee             │ Drift is possible               │ Both sources share one AudioContext clock │
  ├────────────────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
  │ Browser autoplay policy    │ Two separate policies to manage │ One context to resume                     │
  └────────────────────────────┴─────────────────────────────────┴───────────────────────────────────────────┘

  Signal Graph

                          ┌──────────────────────────────────────┐
                          │           AudioContext                │
                          │                                       │
    Voice Track URL ──►  [MediaElementSourceNode / BufferSource] │
                                │                                 │
                             [GainNode  voiceGain = 1.0] ─────►  │
                                                                  │
    Ambient Track URL ──► [MediaElementSourceNode / BufferSource] │  ──► [destination]
                                │                                 │        (speakers)
                             [GainNode ambientGain = 0.4] ──────► │
                          └──────────────────────────────────────┘

  useAudioEngine.js — Core Hook

  // src/hooks/useAudioEngine.js
  import { useRef, useEffect, useCallback } from 'react';

  export function useAudioEngine() {
    const ctxRef      = useRef(null);
    const voiceSrc    = useRef(null);  // MediaElementAudioSourceNode
    const ambientSrc  = useRef(null);
    const voiceGain   = useRef(null);
    const ambientGain = useRef(null);

    // Lazy-init AudioContext on first user gesture (browser policy)
    const getCtx = useCallback(() => {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume();
      }
      return ctxRef.current;
    }, []);

    const attachVoice = useCallback((audioElement) => {
      const ctx = getCtx();
      if (voiceSrc.current) voiceSrc.current.disconnect();

      voiceSrc.current  = ctx.createMediaElementSource(audioElement);
      voiceGain.current = ctx.createGain();
      voiceGain.current.gain.value = 1.0;

      voiceSrc.current.connect(voiceGain.current);
      voiceGain.current.connect(ctx.destination);
    }, [getCtx]);

    const attachAmbient = useCallback((audioElement) => {
      const ctx = getCtx();
      if (ambientSrc.current) ambientSrc.current.disconnect();

      ambientSrc.current  = ctx.createMediaElementSource(audioElement);
      ambientGain.current = ctx.createGain();
      ambientGain.current.gain.value = 0.4;

      ambientSrc.current.connect(ambientGain.current);
      ambientGain.current.connect(ctx.destination);
    }, [getCtx]);

    // Smooth volume ramp — avoids audible pops
    const setVoiceVolume = useCallback((value) => {
      const ctx = getCtx();
      voiceGain.current?.gain.linearRampToValueAtTime(
        value, ctx.currentTime + 0.05
      );
    }, [getCtx]);

    const setAmbientVolume = useCallback((value) => {
      const ctx = getCtx();
      ambientGain.current?.gain.linearRampToValueAtTime(
        value, ctx.currentTime + 0.05
      );
    }, [getCtx]);

    // Crossfade to a new ambient source
    const crossfadeAmbient = useCallback((newAudioElement, durationSec = 1.5) => {
      const ctx = getCtx();
      const now = ctx.currentTime;
      const current = ambientGain.current?.gain.value ?? 0.4;

      // Fade out old
      ambientGain.current?.gain.linearRampToValueAtTime(0, now + durationSec);

      setTimeout(() => {
        attachAmbient(newAudioElement);
        ambientGain.current.gain.setValueAtTime(0, ctx.currentTime);
        ambientGain.current.gain.linearRampToValueAtTime(
          current, ctx.currentTime + durationSec
        );
        newAudioElement.play();
      }, durationSec * 1000);
    }, [getCtx, attachAmbient]);

    useEffect(() => () => ctxRef.current?.close(), []);

    return { attachVoice, attachAmbient, setVoiceVolume, setAmbientVolume, crossfadeAmbient };
  }

  AudioPlayer.jsx — Wiring it together

  // src/components/player/AudioPlayer.jsx
  import { useRef, useEffect } from 'react';
  import { useAudioEngine } from '../../hooks/useAudioEngine';
  import { usePlayer } from '../../context/PlayerContext';
  import AmbientMixer from './AmbientMixer';

  export default function AudioPlayer() {
    const voiceRef   = useRef(null);
    const ambientRef = useRef(null);
    const { attachVoice, attachAmbient, setVoiceVolume, setAmbientVolume } = useAudioEngine();
    const { currentTrack, isPlaying, position, dispatch } = usePlayer();

    useEffect(() => {
      if (voiceRef.current)   attachVoice(voiceRef.current);
      if (ambientRef.current) attachAmbient(ambientRef.current);
    }, []);                  // attach once; nodes persist across re-renders

    useEffect(() => {
      isPlaying ? voiceRef.current?.play() : voiceRef.current?.pause();
    }, [isPlaying]);

    return (
      <div dir="auto" className="player-shell">
        {/* Hidden managed audio elements */}
        <audio ref={voiceRef}   src={currentTrack?.audioUrl} preload="metadata" />
        <audio ref={ambientRef} src={currentTrack?.ambientUrl} loop preload="auto" />

        {/* Exposed controls */}
        <AmbientMixer onVolumeChange={setAmbientVolume} />
        {/* ...play/pause, progress slider, voice volume slider */}
      </div>
    );
  }

  ---
  5. RTL / Hebrew Localization Strategy

  - Use react-i18next for all string keys; he.json provides full translations.
  - Set <html dir="rtl" lang="he"> dynamically via LocaleContext.
  - Use Tailwind's rtl: variant for mirrored layout (e.g., rtl:text-right, rtl:flex-row-reverse).
  - The AppShell wrapper reads LocaleContext and passes dir down — no component needs to know about RTL directly.
  - Sliders and progress bars use direction: rtl CSS when locale is Hebrew so they fill right-to-left naturally.

  ---
  6. Authentication Flow

  Login ──► POST /auth/login
             │
             ├── Server sets HttpOnly cookie: refreshToken (7 days)
             └── Response body: accessToken (JWT, 15 min)

  Every API call ──► Authorization: Bearer <accessToken>
                       │
                      (expires) ──► axios interceptor calls POST /auth/refresh
                                     └── Gets new accessToken silently

  Access tokens live only in memory (AuthContext state), never in localStorage — this prevents XSS exfiltration. The HttpOnly cookie is inaccessible to
  JavaScript.

  ---
  Recommended Packages

  ┌──────────┬──────────────────────────────┬───────────────────────────────────────────┐
  │  Layer   │           Package            │                  Purpose                  │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Frontend │ react-i18next                │ i18n + RTL strings                        │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Frontend │ framer-motion                │ Page + card transitions                   │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Frontend │ @tanstack/react-query        │ Server state, caching, background refetch │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Frontend │ axios                        │ HTTP + interceptor-based token refresh    │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Frontend │ tailwindcss + tailwind-merge │ Styling                                   │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ express                      │ HTTP server                               │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ jsonwebtoken                 │ JWT sign/verify                           │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ bcryptjs                     │ Password hashing                          │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ prisma                       │ Type-safe ORM for PostgreSQL              │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ zod                          │ Runtime env/request validation            │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ express-rate-limit           │ Brute-force protection on /auth/*         │
  └──────────┴──────────────────────────────┴───────────────────────────────────────────┘

  │ Frontend │ @tanstack/react-query        │ Server state, caching, background refetch │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Frontend │ axios                        │ HTTP + interceptor-based token refresh    │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Frontend │ tailwindcss + tailwind-merge │ Styling                                   │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ express                      │ HTTP server                               │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ jsonwebtoken                 │ JWT sign/verify                           │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ bcryptjs                     │ Password hashing                          │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ prisma                       │ Type-safe ORM for PostgreSQL              │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ zod                          │ Runtime env/request validation            │
  ├──────────┼──────────────────────────────┼───────────────────────────────────────────┤
  │ Backend  │ express-rate-limit           │ Brute-force protection on /auth/*         │
  └──────────┴──────────────────────────────┴───────────────────────────────────────────┘

  ---
  The dual-layer Web Audio API approach is the right choice because the AudioContext clock is shared between both sources, guaranteeing they never drift apart — a
   critical quality bar for a meditation app where an out-of-sync ambient layer would break immersion. The GainNode ramps also mean volume changes are inaudible
  to the listener, unlike a raw element.volume step.

  The next natural step would be to scaffold the Vite + React project and the Express server, then wire up the auth endpoints and the audio engine hook. Let me
  know which layer you want to build first.