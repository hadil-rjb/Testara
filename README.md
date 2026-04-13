# Testara - AI-Powered QA Automation Platform

## Architecture

```
Testara_Partie1/
├── frontend/          # Next.js 15 (App Router)
│   ├── src/
│   │   ├── app/[locale]/          # i18n routes (fr/en)
│   │   │   ├── (landing)/         # Landing page (public)
│   │   │   ├── auth/              # Auth pages
│   │   │   └── dashboard/         # Protected dashboard
│   │   ├── components/            # Reusable UI components
│   │   │   ├── landing/           # Landing page sections
│   │   │   ├── auth/              # Auth form components
│   │   │   └── dashboard/         # Dashboard components
│   │   ├── i18n/                  # next-intl config
│   │   ├── messages/              # Translation files (fr.json, en.json)
│   │   ├── lib/                   # API client (axios)
│   │   └── stores/                # Zustand state management
│   └── next.config.ts
│
└── backend/           # NestJS
    └── src/
        ├── auth/                  # JWT + Google OAuth + password reset
        │   ├── dto/
        │   ├── guards/
        │   └── strategies/
        ├── users/                 # User CRUD + schema
        ├── projects/              # Project CRUD + schema
        └── mail/                  # Email service (nodemailer)
```

## Tech Stack

| Layer          | Technology                                |
|----------------|------------------------------------------|
| Frontend       | Next.js 15 (App Router), Tailwind CSS    |
| Backend        | NestJS, Mongoose                         |
| Database       | MongoDB                                  |
| Auth           | JWT (access + refresh), Google OAuth 2.0 |
| i18n           | next-intl (fr/en, dynamic [locale] routing) |
| State          | Zustand                                  |
| Theme          | Light/Dark mode (localStorage persisted) |
| Animations     | Framer Motion                            |
| Icons          | Lucide React                             |

## Setup

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend
cp .env .env.local    # Edit with your values
npm install
npm run start:dev     # Runs on http://localhost:3001
```

Configure `.env`:
- `MONGODB_URI` — your MongoDB connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — generate strong random strings
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — from Google Cloud Console
- `MAIL_*` — SMTP credentials for password reset emails

### 2. Frontend

```bash
cd frontend
npm install
npm run dev           # Runs on http://localhost:3000
```

The frontend `.env.local` is pre-configured to connect to `localhost:3001`.

## Features

### Authentication
- Email/password registration with account type selection (Individual/Enterprise)
- Email/password login
- Google OAuth login
- Forgot password (email-based flow)
- Reset password (secure token with expiration)
- JWT access + refresh token rotation
- bcrypt password hashing (12 rounds)
- Input validation via class-validator DTOs
- Rate limiting via @nestjs/throttler

### Landing Page
- Hero with animated dashboard mockup
- 6 feature cards with colored icons
- 4-step process section with alternating layout
- Purple gradient CTA banner
- Testimonial cards with star ratings
- Accordion FAQ
- Responsive navbar with mobile hamburger menu

### Dashboard (Protected)
- Collapsible sidebar with navigation
- Search bar + theme toggle + notifications
- Welcome greeting with user name
- Project creation form (name + URL)
- Recent projects grid with status badges and stats

### i18n
- French (default) and English
- Dynamic routing: `/fr/...` and `/en/...`
- All UI text is translatable via JSON message files

### Theme
- Light/Dark mode toggle in dashboard top bar
- Preference persisted in localStorage
- CSS custom properties for seamless theme switching

## API Endpoints

| Method | Endpoint                  | Auth | Description           |
|--------|--------------------------|------|-----------------------|
| POST   | /api/auth/register       | No   | Create account        |
| POST   | /api/auth/login          | No   | Login                 |
| GET    | /api/auth/google         | No   | Google OAuth redirect |
| GET    | /api/auth/google/callback| No   | Google OAuth callback |
| POST   | /api/auth/forgot-password| No   | Send reset email      |
| POST   | /api/auth/reset-password | No   | Reset with token      |
| POST   | /api/auth/refresh        | No   | Refresh tokens        |
| GET    | /api/users/me            | Yes  | Get profile           |
| PUT    | /api/users/me            | Yes  | Update profile        |
| GET    | /api/projects            | Yes  | List user projects    |
| POST   | /api/projects            | Yes  | Create project        |
| GET    | /api/projects/:id        | Yes  | Get project           |
| DELETE | /api/projects/:id        | Yes  | Delete project        |
