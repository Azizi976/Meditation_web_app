# Calm & Reflect 🧘

A modern, full-stack meditation web application with dual-layer audio mixing, Hebrew RTL support, and a calming pastel UI.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS v3, Framer Motion |
| State / Data | React Query, Context API |
| Audio | Web Audio API (dual GainNode mixing) |
| i18n | react-i18next (English + Hebrew RTL) |
| Backend | Node.js, Express 5 |
| Database | Prisma 5 + SQLite |
| Auth | JWT access tokens + HttpOnly refresh cookie rotation |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### 1. Clone and install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Set up the database

```bash
cd server
npm run db:migrate   # Creates the SQLite database
npm run db:seed      # Seeds categories, meditations, ambient sounds, and a demo user
```

### 3. Run both servers

Open two terminals:

```bash
# Terminal 1 — API server (port 5000)
cd server
npm run dev

# Terminal 2 — React dev server (port 5173)
cd client
npm run dev
```

Open `http://localhost:5173`

### Demo credentials

```
Email:    demo@calmreflect.app
Password: demo1234
```

---

## Project Structure

```
calm-reflect/
├── client/                          # React Frontend (Vite)
│   └── src/
│       ├── components/
│       │   ├── ui/                  # Button, Badge, Spinner
│       │   ├── layout/              # AppShell, Navbar
│       │   ├── player/              # PersistentPlayer, AmbientMixer
│       │   └── meditation/          # MeditationCard, CategoryFilter
│       ├── context/
│       │   ├── AuthContext.jsx      # User session state
│       │   ├── PlayerContext.jsx    # Global playback state
│       │   └── LocaleContext.jsx    # Language + RTL direction
│       ├── hooks/
│       │   └── useAudioEngine.js    # Web Audio API dual-layer engine
│       ├── services/                # Axios API calls
│       ├── pages/                   # Home, Library, Login, Register, Profile
│       └── i18n/                    # en.json, he.json translations
│
└── server/                          # Node.js / Express Backend
    ├── prisma/
    │   ├── schema.prisma            # Full database schema
    │   └── seed.js                  # Sample data seeder
    └── src/
        ├── controllers/             # authController, meditationController, etc.
        ├── middleware/              # authenticate (JWT), errorHandler
        ├── routes/                  # /auth, /meditations, /ambient, /user
        └── app.js                   # Express entry point
```

---

## Features

### Dual-Layer Audio Engine

The player mixes two independent audio streams through the Web Audio API:

```
Voice Track  → GainNode (voiceGain)   ─┐
                                        ├─► AudioContext.destination (speakers)
Ambient Track → GainNode (ambientGain) ─┘
```

Both gain nodes share the same `AudioContext` clock, so they never drift. Volume changes use `linearRampToValueAtTime` for smooth, click-free fades. Switching ambient tracks triggers a crossfade.

### Hebrew RTL Support

Switching to Hebrew from the navbar or Profile settings:
- Sets `<html dir="rtl" lang="he">`
- Tailwind `rtl:` variants mirror all flex layouts and text alignment
- All UI strings swap to Hebrew via i18next

### Authentication

- **Access token** (15 min) — stored in memory only, never `localStorage`
- **Refresh token** (7 days) — HttpOnly cookie, rotated on every use
- Axios interceptor silently refreshes expired access tokens

---

## API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Sign in |
| POST | `/api/auth/refresh` | Cookie | Rotate refresh token |
| POST | `/api/auth/logout` | Cookie | Invalidate session |
| GET | `/api/auth/me` | Bearer | Get current user |

### Meditations

| Method | Endpoint | Query params |
|--------|----------|-------------|
| GET | `/api/meditations` | `category`, `lang`, `limit`, `offset` |
| GET | `/api/meditations/:id` | `lang` |
| GET | `/api/meditations/categories` | `lang` |

### Ambient Sounds

| Method | Endpoint | Query params |
|--------|----------|-------------|
| GET | `/api/ambient` | `lang` |

### User (requires Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET / POST / DELETE | `/api/user/favorites/:id` | Manage favorites |
| GET / POST | `/api/user/progress/:id` | Track listening position |
| GET / PUT | `/api/user/preferences` | Persist mixer state |

---

## Adding Audio Files

The app expects audio assets at the paths defined in the seed data. Place your `.mp3` files here:

```
client/public/
├── audio/
│   ├── meditations/
│   │   ├── deep-sleep.mp3
│   │   ├── calm-storm.mp3
│   │   ├── laser-focus.mp3
│   │   └── ...
│   └── ambient/
│       ├── rain.mp3
│       ├── forest.mp3
│       ├── ocean.mp3
│       ├── white-noise.mp3
│       ├── fire.mp3
│       └── bowl.mp3
```

---

## Database Schema (key tables)

```
User           — id, email, passwordHash, displayName, language
Session        — refreshToken, expiresAt (rolling rotation)
Meditation     — titleEn/He, audioUrl, durationSeconds, categoryId
Category       — slug, nameEn/He, icon
AmbientSound   — nameEn/He, audioUrl, icon
UserProgress   — lastPositionSeconds, completed
UserFavorite   — userId + meditationId (composite PK)
UserPreferences— voiceVolume, ambientVolume, ambientSoundId
```

Run `npm run db:studio` inside `/server` to open Prisma Studio and browse data visually.

---

## Environment Variables

`server/.env` (already created):

```env
DATABASE_URL="file:./dev.db"
JWT_ACCESS_SECRET=change_in_production
JWT_REFRESH_SECRET=change_in_production
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## Scripts

### Server

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with nodemon (hot reload) |
| `npm start` | Start production server |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed sample data |
| `npm run db:studio` | Open Prisma Studio GUI |

### Client

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
