# Testara — AI-Powered QA Automation Platform

Testara is a full-stack web application that helps QA teams automate, run, and analyze tests on web applications. Enter a URL, launch a workspace, and explore scenarios, reports, and AI-assisted test authoring — all in a clean, modern, bilingual interface.

## Architecture

```
Testara_Partie1/
├── frontend/                        # Next.js 16 (App Router) + Tailwind CSS v4
│   ├── src/
│   │   ├── app/[locale]/            # i18n routes (fr/en)
│   │   │   ├── (landing)/           # Landing page (public)
│   │   │   ├── auth/                # Login, register, forgot/reset, account type
│   │   │   ├── dashboard/           # Protected dashboard
│   │   │   │   ├── projects/        # Projects index (filters, export, pagination)
│   │   │   │   └── settings/        # Profile, security, preferences
│   │   │   └── workspace/[id]/      # Per-project workspace (sidebar + AI chat)
│   │   ├── components/
│   │   │   ├── landing/             # Hero, features, process, CTA, FAQ…
│   │   │   ├── auth/                # Login/register/reset forms
│   │   │   ├── dashboard/           # Sidebar, TopBar, ProjectCard, FilterPopover…
│   │   │   ├── workspace/           # Workspace shell, AgentHelper chat
│   │   │   └── settings/            # SettingsShell + Profile/Security/Preferences tabs
│   │   ├── i18n/                    # next-intl routing config
│   │   ├── messages/                # Translation bundles (fr.json, en.json)
│   │   ├── lib/                     # Axios client, export utilities (PDF/XLSX/CSV)
│   │   └── stores/                  # Zustand stores (auth, …)
│   └── next.config.ts
│
└── backend/                         # NestJS + Mongoose
    └── src/
        ├── auth/                    # JWT + Google OAuth + password reset
        │   ├── dto/  guards/  strategies/
        ├── users/                   # User CRUD, profile update, change-password
        ├── projects/                # Project CRUD + schema
        └── mail/                    # Nodemailer service (reset emails)
```

## Tech Stack

| Layer        | Technology                                                       |
|--------------|------------------------------------------------------------------|
| Frontend     | Next.js 16 (App Router), React 19, Tailwind CSS v4               |
| Backend      | NestJS 11, Mongoose                                              |
| Database     | MongoDB                                                          |
| Auth         | JWT (access + refresh), Google OAuth 2.0, bcrypt (12 rounds)     |
| i18n         | next-intl 4 (fr/en, dynamic `[locale]` routing)                  |
| State        | Zustand                                                          |
| Theming      | Light/Dark via `data-theme` + CSS custom properties              |
| Exports      | `xlsx` (Excel), `jspdf` + `jspdf-autotable` (PDF), CSV fallback  |
| Animations   | Framer Motion                                                    |
| Icons        | Lucide React                                                     |
| Validation   | class-validator / class-transformer                              |
| Rate limit   | @nestjs/throttler                                                |

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
cp .env .env.local    # edit with your values
npm install
npm run start:dev     # http://localhost:3001
```

Required `.env` keys:
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — strong random strings
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `MAIL_*` — SMTP credentials for password-reset emails

### 2. Frontend

```bash
cd frontend
npm install
npm run dev           # http://localhost:3000
```

The frontend `.env.local` is pre-configured to hit `http://localhost:3001`.

## Features

### Authentication
- Email/password registration with account type selection (Individual / Enterprise)
- Email/password login
- Google OAuth login
- Forgot password (email-based flow) and reset password (secure token with expiration)
- JWT access + refresh token rotation
- bcrypt password hashing (12 rounds)
- Input validation via class-validator DTOs
- Rate limiting via `@nestjs/throttler`

### Landing Page
- Hero with animated dashboard mockup
- 6 feature cards with colored icons
- 4-step process section with alternating layout
- Purple gradient CTA banner
- Testimonial cards with star ratings
- Accordion FAQ
- Responsive navbar with mobile hamburger menu

### Dashboard (Protected)
- Collapsible sidebar with recent-projects list, active-state nav, and mobile drawer
- TopBar with search, theme toggle, notifications, and user avatar menu
- Welcome greeting with user name
- Quick project creation (name + URL) that redirects into a live workspace

### Projects Page
- Grid of project cards with status badges, owner avatar, and run stats
- **Advanced filtering** via popover: multi-select environment & status chips, date-range (all / today / this week / this month), active-count badge
- **Active-filter chips** shown inline with individual remove + "Clear all"
- **Search** with inline clear, plus **sort** (newest / oldest / name A–Z)
- **Export dropdown** generating real files on the client:
  - `.pdf` — branded landscape report via `jsPDF` + `jspdf-autotable`
  - `.xlsx` — Excel workbook via SheetJS (`xlsx`)
  - `.csv` — UTF-8 BOM for Excel compatibility
- **Per-page selector** (6 / 12 / 24 / 48) and full pagination (first / prev / numbered pages with ellipsis / next / last)
- Rename & delete from a card context menu, create via modal (auto-opens with `?create=1`)
- Filter/search/sort/per-page changes auto-reset pagination to page 1

### Workspace (per project)
- Sidebar (scenarios / runs / reports), main working area, and AI assistant chat panel
- Smooth loading state while the project is being prepared
- Deep-linkable via `/workspace/[id]`

### Settings
Three tabs under `/dashboard/settings`, with a shared toast system.

- **Profile** — avatar upload (JPG/PNG/GIF/WEBP, 2 MB limit, base64 encoded), remove avatar, first name, last name, email. Save button only enabled when the form is dirty.
- **Security** — change password with current / new / confirm fields, show-hide toggles, live **password-strength meter** (Weak → Fair → Good → Strong), confirm-match inline error, 401 handling for wrong current password, dedicated info card instead of the form for Google-only accounts, and a **Danger Zone** with logout.
- **Preferences** — language switch 🇫🇷 Français / 🇬🇧 English (updates next-intl locale + persists `languagePreference`) and theme switch with visual **Light / Dark preview cards** (persists `themePreference`). Both preferences are synced to the backend so they follow the user across devices.

### i18n
- French (default) and English
- Dynamic routing: `/fr/...` and `/en/...`
- All UI text is translatable via JSON message bundles (`src/messages/fr.json`, `en.json`)
- User language preference is persisted server-side

### Theme
- Light/Dark mode toggle in dashboard top bar (and in Settings → Preferences)
- Preference persisted in `localStorage` and synced to the backend
- CSS custom properties driven by `data-theme` for seamless switching

## API Endpoints

| Method | Endpoint                            | Auth | Description                        |
|--------|-------------------------------------|------|------------------------------------|
| POST   | /api/auth/register                  | No   | Create account                     |
| POST   | /api/auth/login                     | No   | Login                              |
| GET    | /api/auth/google                    | No   | Google OAuth redirect              |
| GET    | /api/auth/google/callback           | No   | Google OAuth callback              |
| POST   | /api/auth/forgot-password           | No   | Send reset email                   |
| POST   | /api/auth/reset-password            | No   | Reset with token                   |
| POST   | /api/auth/refresh                   | No   | Refresh tokens                     |
| GET    | /api/users/me                       | Yes  | Get profile                        |
| PATCH  | /api/users/me                       | Yes  | Update profile (name/email/avatar/theme/lang) |
| POST   | /api/users/me/change-password       | Yes  | Change password (blocked for Google-only users) |
| POST   | /api/users/me/complete-onboarding   | Yes  | Finish account-type onboarding     |
| GET    | /api/projects                       | Yes  | List user projects                 |
| POST   | /api/projects                       | Yes  | Create project                     |
| GET    | /api/projects/:id                   | Yes  | Get project                        |
| PATCH  | /api/projects/:id                   | Yes  | Update project (rename)            |
| DELETE | /api/projects/:id                   | Yes  | Delete project                     |

## Scripts

### Backend
```bash
npm run start:dev    # dev server with watch
npm run build        # compile to dist/
npm run start:prod   # run compiled build
npm run lint
```

### Frontend
```bash
npm run dev          # dev server
npm run build        # production build
npm run start        # run the build
npm run lint
```

## Project Status

Part 1 deliverables — authentication, landing, dashboard, projects management (filters/export/pagination), workspace shell, full settings section, i18n, and theming — are complete. Type-checks pass cleanly on both the frontend and backend.
