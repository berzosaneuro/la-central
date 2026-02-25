# CLAUDE.md — EL JEFAZO OS (la-central)

This file provides guidance for AI assistants (and human developers) working on this codebase.

---

## Project Overview

**EL JEFAZO OS** is a mobile-first Progressive Web App (PWA) built as a master control panel. It manages a fleet of "clones" (deployed application instances), tracks subscriptions/renewals, and provides a centralized command interface — all themed around a futuristic, neon-dark "jefazo" aesthetic.

The app is entirely client-side. All state is persisted via `localStorage`. No backend API routes or database connections are used in the current implementation.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI Library | React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion 12 |
| Notifications | React Hot Toast 2 |
| OCR | Tesseract.js 7 |
| Firebase | Firebase 12 + Firebase Admin 13 (configured, not yet active) |
| Package Manager | pnpm (npm also works) |

---

## Directory Structure

```
la-central/
├── app/
│   ├── layout.tsx       # Root layout: metadata, PWA config, viewport
│   ├── page.tsx         # Entry point — renders <JefazoOS />
│   └── globals.css      # Global styles, Tailwind, CSS variables
├── components/
│   └── jefazo-os.tsx    # Main application (~1,200 lines, all screens)
├── public/
│   ├── manifest.json    # PWA manifest (name, icons, theme)
│   ├── bugatti.jpg      # Login screen background image
│   ├── icon-192.png     # PWA icon
│   └── icon-512.png     # PWA icon
├── next.config.ts       # Next.js config (minimal, extend as needed)
├── tsconfig.json        # TypeScript config (strict, path alias @/*)
├── eslint.config.mjs    # ESLint (Next.js + TypeScript rules)
└── postcss.config.mjs   # PostCSS with Tailwind
```

---

## Key Source File: `components/jefazo-os.tsx`

This single file contains the entire application. It is organized as follows:

### Data Interfaces
- `Renovacion` — subscription/renewal item (domain, hosting, API keys, etc.)
- `Clone` — a deployed app instance (version, status, server, income, score)
- `GlobalState` — master switches (master on/off, maintenance, emergency, autoUpdate)
- `AdminSettings` — phone & email for contact
- `ActivityLog` — timestamped system event

### Utility Functions
| Function | Purpose |
|---|---|
| `LS` | `localStorage` wrapper with namespaced keys (`jz_*`) |
| `semver` | Parse and compare semantic version strings |
| `daysUntil()` | Days remaining until a date |
| `fmtDate()` / `fmtDT()` | Date formatting (Spanish locale) |
| `calcScore()` | Clone health score (0–100) |
| `renovEstado()` | Renewal status: `OK`, `PROXIMO`, `CRITICO`, `VENCIDO`, `SNOOZED` |

### Audio System (`SFX`)
Synthesized sounds via the Web Audio API (no audio files). Keys: `login`, `notify`, `error`, `click`, `alert`, `success`.

### Color Theme (`T` object)
Centralized color constants:
- Primary: `#00C8FF` (neon blue), `#3A9FFF` (electric blue)
- Backgrounds: `#000410` (dark), `#0A1628` (card)
- Status: `#00FF80` (green), `#FFA040` (orange), `#FF4466` (red)

### Reusable UI Components
`NeonBorder`, `Btn`, `Card`, `InputField`, `Toggle`, `Toast`, `Label`, `Badge`, `HudStat`, `ScoreBar`, `Header`, `Screen`, `Modal`, `QuickActions`

### Application Screens
| Screen | Route Key | Description |
|---|---|---|
| `LoginScreen` | — | Auth gate with metallic 3D effects |
| `Ecosystem` | `ecosystem` | Master dashboard, clone list & HUD |
| `CloneCtrl` | `clone` | Per-clone controls, metrics, actions |
| `AddClone` | `addClone` | Form to create a new clone |
| `Marketplace` | `marketplace` | Install predefined clone templates |
| `CentroMando` | `centroMando` | Global switches, backup/import |
| `Renovaciones` | `renovaciones` | Subscription renewal tracker |
| `Comunicaciones` | `comms` | WhatsApp/email message templates |
| `ShareQR` | `share` | QR code & link sharing |
| `AdminPanel` | `admin` | Aggregated metrics and activity log |
| `InsightsPanel` | `insights` | Auto-generated AI-style recommendations |
| `EmergencyScreen` | `emergency` | System-wide emergency actions |
| `CriticalAlert` | overlay | Modal alert for expired/critical renewals |

### Main Component (`JefazoOS`)
- Single top-level state object
- Navigation via `screen` state string + `slideDir` for animation direction
- Monitors for critical renewals on every state change
- Imports/exports state as JSON

---

## LocalStorage Keys

All keys are prefixed with `jz_`:

| Key | Contents |
|---|---|
| `jz_clones` | Array of `Clone` objects |
| `jz_renov` | Array of `Renovacion` objects |
| `jz_gs` | `GlobalState` object |
| `jz_adminSettings` | Admin phone & email |
| `jz_comms_ph` | WhatsApp number (Comunicaciones) |
| `jz_comms_em` | Email address (Comunicaciones) |
| `jz_share_url` | Deployment URL (ShareQR) |

---

## Development Workflow

### Setup
```bash
pnpm install       # Install dependencies
pnpm dev           # Start dev server at http://localhost:3000
```

### Build & Lint
```bash
pnpm build         # Production build (outputs to .next/)
pnpm start         # Serve production build
pnpm lint          # Run ESLint
```

### No Tests
There is currently no test framework. If adding tests, prefer Vitest (compatible with Next.js and the existing TypeScript config).

---

## Conventions & Coding Style

### TypeScript
- Strict mode is enabled. All types must be explicit; avoid `any`.
- Path alias `@/*` maps to the project root.
- Target: ES2017 — avoid features not supported in that target.

### Component Patterns
- Screens are defined as standard React functional components inside `jefazo-os.tsx`.
- All internal state and navigation live in the parent `JefazoOS` component; screens receive `state` and `setState` (or a setter function) as props.
- Prefer `useCallback` for handlers passed as props and `useMemo` for derived/computed values.

### Styling
- Tailwind CSS utility classes are the primary styling mechanism.
- The `T` color constant object is used for all dynamic inline styles (e.g., borders, glow effects).
- Neon glow effects are applied via `boxShadow` inline styles.
- Safe area insets (`env(safe-area-inset-*)`) are used for mobile notch/home-bar support.
- CSS variables in `globals.css`: `--background` (`#000410`), `--foreground` (`#E0F4FF`).

### Language
- All UI text, labels, and messages are in **Spanish**.
- Keep new user-facing strings in Spanish to match the existing app.

### Audio
- Use `SFX.<key>()` to play sounds. Never import audio files.
- Always wrap `SFX` calls in try/catch — the Web Audio API can throw on some browsers.

### Notifications
- Use `react-hot-toast` (`toast.success`, `toast.error`) for transient feedback.
- Use `PushNotif.send()` for background/push notifications (requires browser permission).

---

## PWA Configuration

- Manifest at `public/manifest.json`: app name, icons, theme color `#000410`, display `standalone`.
- Meta tags in `app/layout.tsx` support iOS standalone mode (`apple-mobile-web-app-capable`).
- Viewport is locked (no user scaling) — do not change this without considering mobile UX.

---

## External Integrations

| Service | How Used |
|---|---|
| QR Server | `https://api.qrserver.com/v1/create-qr-code/` — rendered as `<img>` |
| WhatsApp | `https://wa.me/<number>?text=<msg>` links |
| Telegram | `https://t.me/share/url?url=...` links |
| Email | `mailto:` protocol links |
| Firebase | Installed but not yet wired into active screens |

---

## Security Notes (Important)

- **Hardcoded credentials** exist in `LoginScreen` (`"EL JEFAZO"` / `"berzosa15031980"`). These are demo-only and **must be replaced** before any real-world deployment.
- All application data is stored in `localStorage` (client-side, unencrypted). Do not store genuinely sensitive secrets here.
- Firebase credentials (if added) must be stored in environment variables (`.env.local`), not committed to source control.

---

## Firebase (Future Use)

Firebase packages are installed (`firebase`, `firebase-admin`). When integrating:
- Store config in `.env.local` (Next.js automatically loads this, never committed)
- Use Next.js API routes (`app/api/`) for admin SDK calls
- Client SDK can be initialized in a `lib/firebase.ts` utility file

---

## Deployment

The app is a standard Next.js project and can be deployed to:
- **Vercel** (recommended — zero config)
- **Netlify** (static export or SSR)
- **Any Node.js host** via `pnpm build && pnpm start`

No environment variables are required for the current implementation. When Firebase or other services are added, document required vars in a `.env.example` file.

---

## Git Workflow

- The main stable branch is `master`.
- Feature branches follow the pattern `claude/<description>-<session-id>` for AI-assisted work.
- Commit messages use conventional style: `feat:`, `fix:`, `chore:`, `refactor:`.
