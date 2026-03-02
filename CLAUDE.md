# CLAUDE.md — EL JEFAZO OS

This document provides context for AI assistants working in this repository. It covers the project architecture, development workflows, conventions, and important patterns.

---

## Project Overview

**EL JEFAZO OS** is a Progressive Web App (PWA) that serves as a master control system for managing multiple app "clones" — deployable instances of mobile apps, web apps, or services within a single ecosystem. Version: **5.1.0**

Core capabilities:
- Clone lifecycle management (create, sync, update, monitor)
- Renewal/subscription tracking with critical alerts
- Command center with emergency operations
- Analytics and insights (AI-powered)
- Offline-first with localStorage persistence
- Push notifications and Web Audio sound effects

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| UI Library | React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + inline style objects |
| Animations | Framer Motion |
| Backend | Firebase (installed, not yet wired to UI) |
| Notifications | `react-hot-toast` |
| OCR | Tesseract.js |
| Package Manager | pnpm (also npm lock file present) |

---

## Repository Structure

```
la-central/
├── app/
│   ├── layout.tsx         # Root layout — PWA metadata, fonts, viewport
│   ├── page.tsx           # Home — renders <JefazoOS />
│   └── globals.css        # Global CSS, Tailwind theme, animations, fonts
├── components/
│   └── jefazo-os.tsx      # Entire application (~1,200 lines, single file)
├── public/
│   ├── manifest.json      # PWA manifest (name: "EL JEFAZO OS")
│   ├── bugatti.jpg        # App icon image
│   ├── icon-192.png       # PWA icon 192×192
│   └── icon-512.png       # PWA icon 512×512
├── next.config.ts         # Minimal Next.js config (standard defaults)
├── tsconfig.json          # TypeScript: strict, ES2017, @/* path alias
├── eslint.config.mjs      # ESLint 9 flat config, Next.js rules
├── postcss.config.mjs     # PostCSS with @tailwindcss/postcss
├── package.json           # Scripts and dependencies
└── CLAUDE.md              # This file
```

---

## Development Commands

```bash
pnpm dev       # Start dev server (Next.js)
pnpm build     # Production build
pnpm start     # Serve production build
pnpm lint      # ESLint check
```

> There is no test framework configured. Avoid adding test infrastructure unless explicitly requested.

---

## Architecture: Single-File SPA

All application logic lives in **`components/jefazo-os.tsx`**. This is an intentional monorepo-like choice — do not refactor into multiple files unless explicitly requested.

### Screen Navigation

The app uses a screen-based navigation system. The active screen is tracked via `useState`:

```typescript
const [screen, setScreen] = useState<string>("login")
```

Screens are rendered conditionally inside the main return. Currently defined screens:

| Screen ID | Component | Purpose |
|---|---|---|
| `login` | `LoginScreen` | Authentication entry |
| `ecosystem` | `Ecosystem` | Clone dashboard |
| `clone-ctrl` | `CloneCtrl` | Individual clone controls |
| `add-clone` | `AddClone` | Create new clone |
| `marketplace` | `Marketplace` | Clone template browser |
| `centro-mando` | `CentroMando` | Command center |
| `renovaciones` | `Renovaciones` | Renewal management |
| `comunicaciones` | `Comunicaciones` | Communication settings |
| `admin-panel` | `AdminPanel` | System administration |
| `insights` | `InsightsPanel` | Analytics/AI alerts |
| `emergency` | `EmergencyScreen` | Critical operations |
| `critical-alert` | (overlay) | Urgent renewal modal |

---

## Key Data Interfaces

Defined at the top of `jefazo-os.tsx`:

```typescript
interface Clone {
  id: string
  name: string
  desc: string
  tipo: string        // "mobile" | "web" | "service"
  icon: string        // emoji
  vi: string          // installed version
  vd: string          // available version
  estado: string      // "active" | "inactive" | "error" | "maintenance"
  server: string
  sync: boolean
  upd: boolean        // update available
  perm: boolean       // has permissions
  ch: string[]        // changelog entries
  auto: boolean       // auto-update enabled
  logs: string[]
  prev: string        // preview URL
  ingresos: number    // revenue
  score: number       // 0-100 performance score
}

interface Renovacion {
  id: string
  nombre: string
  tipo: string
  fechaRenovacion: string   // ISO date string
  precio: number
  notas: string
  recordatorioActivado: boolean
  snoozeUntil?: string
}

interface GlobalState {
  master: boolean
  maintenance: boolean
  emergency: boolean
  autoUpdate: boolean
}

interface AdminSettings {
  telefonoMaestro: string
  correoMaestro: string
}

interface ActivityLog {
  id: string
  type: "info" | "ok" | "warn" | "error"
  msg: string
  ts: string
}
```

---

## Design System

### Color Theme

The `T` constant defines the full color palette. Always use it instead of hardcoded hex values:

```typescript
const T = {
  bg: "#000410",         // Main background
  bgCard: "#0A1628",     // Card/panel background
  neon: "#00C8FF",       // Primary neon blue
  neonBright: "#60E8FF", // Bright neon
  border: "#1A5A8A",     // Default border
  borderBright: "#2080C0",
  red: "#FF4466",        // Error/danger
  green: "#00FF80",      // Success/active
  orange: "#FFA040",     // Warning
  yellow: "#FFE040",     // Caution
  electric: "#3A9FFF",   // Accent
  white: "#E0F4FF",      // Text
  gray: "#5A8AAA",       // Secondary text
  grayLight: "#7AACCC",
  dark: "#050C18"        // Deepest background
}
```

### Typography

- **Display headings**: Orbitron (imported via Google Fonts in `globals.css`)
- **Body/UI text**: Rajdhani
- Mobile-first design — max-width **480px**

### Inline Styling Pattern

All component styles are TypeScript objects passed to the `style` prop. This is the established pattern — do not introduce CSS modules or styled-components:

```typescript
<div style={{ background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12 }}>
```

---

## Reusable UI Components

Defined within `jefazo-os.tsx` — do not create external component files unless asked:

| Component | Purpose |
|---|---|
| `NeonBorder` | Animated neon gradient border wrapper |
| `Btn` | Multi-state button with sound & visual feedback |
| `Card` | Content container with optional neon border |
| `InputField` | Styled text input |
| `Toggle` | Switch/toggle control |
| `Toast` | Notification popup |
| `Label` | Styled label text |
| `Badge` | Status badge |
| `HudStat` | Statistics display block |
| `ScoreBar` | Performance bar 0–100 |
| `Header` | Screen header with back navigation |
| `Screen` | Screen container (handles auto-scroll) |
| `Modal` | Overlay dialog |
| `QuickActions` | Floating action menu |

---

## Subsystems

### Sound System (`SFX`)

Web Audio API-based tone generation. Call via:
```typescript
SFX.login()
SFX.notify()
SFX.error()
SFX.click()
SFX.alert()
SFX.success()
```

### Push Notifications (`PushNotif`)

Browser Notification API wrapper. Usage:
```typescript
PushNotif.request()              // Request permission
PushNotif.send(title, body)      // Show notification
```

### Persistence (`LS`)

localStorage wrapper with `jz_` prefix:
```typescript
LS.get(key)
LS.set(key, value)
LS.del(key)
```

### Utility Functions

```typescript
semver(a, b)       // Compare semantic versions: -1 | 0 | 1
delay(ms)          // Async delay with random jitter
uid()              // Generate unique ID
daysUntil(date)    // Days until ISO date string
fmtDate(date)      // Locale date (Spanish/MX)
fmtDT(date)        // Locale datetime (Spanish/MX)
renovEstado(r)     // Renewal status: "ok"|"warn"|"critical"|"expired"
calcScore(clone)   // Clone performance score 0-100
```

---

## Language & Naming Conventions

- **UI text and labels**: Spanish (the app is Spanish-language)
- **Code identifiers**: English (functions, variables, interfaces)
- **Domain-specific nouns** remain in Spanish: `renovaciones`, `clon/clones`, `ecosistema`, `jefazo`
- **Dates**: Formatted for `es-MX` locale
- **localStorage keys**: Prefixed with `jz_` (e.g., `jz_clones`, `jz_renovaciones`)

---

## State Management

All state is managed with React hooks in the main `JefazoOS` component:

- `useState` for UI state, screen navigation, and data arrays
- `useEffect` for initialization from localStorage and interval-based refresh
- `useMemo` / `useCallback` for performance-sensitive operations
- No external state library (Redux, Zustand, etc.)

State is persisted to localStorage on every mutation via the `LS` helper.

---

## Firebase Integration

Firebase packages (`firebase`, `firebase-admin`) are installed but **not yet integrated** into the UI component. When implementing Firebase:

1. Create `/lib/firebase.ts` for client initialization
2. Create `/lib/firebase-admin.ts` for server-side admin SDK
3. Store credentials in `.env.local` (never commit to git)
4. Reference environment variables via `process.env.NEXT_PUBLIC_*` (client) or `process.env.*` (server)

---

## PWA Configuration

The app is a full PWA:
- Manifest: `/public/manifest.json`
- App name: **EL JEFAZO OS**, short name: **JEFAZO**
- Theme color: `#000410`
- Display mode: `standalone`
- Icons: `bugatti.jpg` (all sizes)
- iOS support declared in `app/layout.tsx` via `apple-web-app-capable` meta tag

---

## CSS & Animations

Global styles in `app/globals.css`:
- CSS custom properties: `--background: #000410`, `--foreground: #E0F4FF`
- 20+ named `@keyframes` animations (neon glow, pulse, slide, scan, etc.)
- Custom scrollbar styling
- Full-viewport body (`100vh × 100vw`)
- Safe area support for notched devices

---

## Branch & Commit Conventions

- Work on `claude/*` branches for AI-assisted changes
- Main branch: `master`
- Commit messages follow conventional format: `feat:`, `fix:`, `refactor:`, `docs:`
- Remote: `http://local_proxy@127.0.0.1:45986/git/berzosaneuro/la-central`

---

## Known Gaps & Caveats

1. **No tests**: No test framework is configured. Do not add one unless explicitly requested.
2. **Monolithic component**: `jefazo-os.tsx` is ~1,200 lines by design. Do not split unless asked.
3. **No CI/CD**: No GitHub Actions or other pipeline configured.
4. **No pre-commit hooks**: No Husky/lint-staged. Run `pnpm lint` manually.
5. **Firebase not wired**: UI is fully client-side with localStorage only.
6. **Dual lock files**: Both `package-lock.json` and `pnpm-lock.yaml` exist — prefer pnpm.
7. **README.md**: Contains only the default Next.js boilerplate; not project-specific.
