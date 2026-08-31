# Ryokai Frontend

![React](https://img.shields.io/badge/React-19-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8.svg)
![Type](https://img.shields.io/badge/Language-JavaScript_(JSX)-f7df1e.svg)

**Ryokai** frontend — a tri-modal collaboration workspace (Personal / Crew / Organization) with tasks, projects, crews, organizations, GitHub integration, notes, whiteboards, calendar, focus, analytics, goals, and a platform control plane.

Backend counterpart: [`../Ryokai_backend`](../Ryokai_backend/ryokai/README.md) (Spring Boot 4, REST `/api/v1` + STOMP WebSocket).

---

## Technology Stack

| Concern | Technology |
|---|---|
| UI framework | React 19 (JSX, ES modules) |
| Build tool | Vite 7 (`@vitejs/plugin-react`) |
| Styling | Tailwind CSS 4 (via `@tailwindcss/vite`) |
| Routing | react-router-dom 7 (BrowserRouter, lazy-loaded routes) |
| Server state | TanStack Query 5 (queryClient + queryKeys in `src/shared/api`) |
| Client state | Zustand 5 (per-domain stores, e.g. authentication) + context providers |
| Forms & validation | react-hook-form + zod |
| UI primitives | Radix UI, lucide-react, cmdk, sonner (toasts), framer-motion + GSAP (motion), dnd-kit (drag & drop) |
| 3D / graph | three.js + react-force-graph-3d ("Nebula" task space) |
| Charts | recharts |
| Realtime | @stomp/stompjs (WebSocket via backend `VITE_API_URL`) |
| HTTP | axios (singleton in `src/shared/api/api.js`) |
| Testing | Vitest + Testing Library (+ Playwright available) |
| Linting | ESLint 9 flat config incl. **architecture boundary rules** |

## Getting Started

### Prerequisites
- Node.js 20+ (CI uses Node 20)
- npm

### Install & Run
```bash
npm ci            # or: npm install
npm run dev       # Vite dev server (default http://localhost:5173)
```

### Environment
Create `.env` (a committed example exists) with:

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Backend base URL, e.g. `http://localhost:8080/api/v1` (falls back to `http://localhost:8080/api/v1`; a console warning fires in prod builds when unset) |

### Scripts
| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build (output `dist/`) |
| `npm run preview` | Preview the production build |
| `npm run test` | Run Vitest suite |
| `npm run lint` | ESLint incl. FSD boundary checks |

### Deploy verification (optional but recommended)
`scripts/verify-deploy.sh` clones the committed HEAD, audits import casing (Windows-invisible bugs that break Vercel's Linux build), and runs a clean production build:
```bash
bash scripts/verify-deploy.sh
```

---

## Architecture — Domain-Oriented Feature-Sliced Design (FSD)

`src/` is organized as domains; ESLint **forbids deep imports** into another domain's internals (`@/task/pages/**` etc. are banned — import from the domain's public API, e.g. `@/task`). Legacy root-level layers (`@/pages`, `@/features`, `@/widgets`, `@/entities`) are permanently banned.

```
src/
├── app/            Application layer: App.jsx (routes), layouts (Auth, Main, Platform),
│                   providers (App, Theme, Toaster, ErrorBoundary, RealTime, ServerStatus, Workspace),
│                   router (Protected/Public/Tenant/Platform routes, RouteRegistry, guards, listeners)
├── shared/         Cross-domain kernel: api (axios instance, queryClient, queryKeys, mappers),
│                   ui components, hooks, lib, forms, constants, styles, styleguide, workspace-framework
└── <domain>/       Feature domains, each owning its pages/sections/features/entities/api:
    analytics · calendar · crew · dashboard · focus · github · identity · inbox · landing ·
    note · onboarding · organization · platform · project · saved · settings · task · whiteboard
```

Domain sizes (approx.): shared 162 files, organization 108, task 52, crew 52, platform 23, identity 21, app 17, landing 17, project 16, dashboard 13, calendar 12, github 12, onboarding 8, note 7, analytics 6, focus 6, whiteboard 5, saved 5, settings 3, inbox 1.

### Routing map (src/App.jsx)

| Path | Page / guard |
|---|---|
| `/` | RouteResolver (entry redirect) |
| `/landing` | LandingPage |
| `/oauth/callback` | OAuthCallbackPage (runs for both anonymous and authenticated sessions) |
| `/login`, `/register`, `/forgot-password`, `/reset-password`, `/verify-email`, `/session-expired` | Public auth routes (AuthLayout + PublicRoute) |
| `/invite/accept/:token` | AcceptInvitePage (ProtectedRoute) |
| `/platform/dashboard·organizations·users·monitoring·audit·settings` | Platform control plane (PlatformRoute + PlatformPageGuard role checks) |
| `/app/...` | Tenant app (TenantRoute + MainLayout): `dashboard` (index), `tasks` + `tasks/:taskId`, `nebula`, `projects` + `:projectId`, `organizations` + `:orgId` (+administration), `teams` (+ `organizations/:orgId/teams/:teamId`), `crews` (+discover, join, `:crewId`, tasks, `:crewId/whiteboards/:boardId`), `analytics`, `focus`, `inbox`, `settings/profile·security·sessions`, `notes`, `calendar`, `github`, `saved`, `goals`, `directory`, `leave-requests`, `roles-permissions`, `announcements`, `workload` |
| `/ui` (dev only) | UIDesignSystem styleguide |
| `*` | Redirect to `/` |

### State management
- **Server state**: TanStack Query — all backend calls go through `src/shared/api/api.js` (axios; JWT access token injection, automatic `/session/refresh` retry on 401) and domain `features/api/*.api.js` files; keys centralized in `shared/api/queryKeys.js`.
- **Client state**: Zustand stores per domain (e.g. `identity/features/authentication/store`); cross-cutting concerns via providers in `src/app/providers` (Theme, Toaster, ErrorBoundary, RealTime STOMP connection, ServerStatus, Workspace).
- **Realtime**: `RealTimeProvider` connects STOMP over WebSocket using the same `VITE_API_URL`.

### Backend integration
- Base URL: `import.meta.env.VITE_API_URL || http://localhost:8080/api/v1`.
- Auth: JWT access + refresh tokens; OAuth2 (Google/GitHub) via `/oauth/callback`.
- The endpoint surface mirrors the backend 1:1 (auth/session/users, organizations & RBAC & teams, tasks, projects, crews & whiteboards, github, notes, calendar-events, focus, notifications, saved-items, dashboard, mission-control, workspace onboarding/mode).

## Deployment

**Vercel** (`vercel.json`): framework Vite, build `npm run build`, output `dist/`, SPA rewrite `/(.*) → /index.html`, immutable cache for `/assets/*`. Set `VITE_API_URL` in the Vercel project environment.

## Design Docs

`docs/` contains ADRs 001–006 (FSD, theme system, routing, query strategy, state management, performance & motion standards) plus historical audit/implementation notes from August 2026.
