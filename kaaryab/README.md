# KaarYab Afghanistan

> Afghanistan's leading opportunity platform — discover jobs, internships, scholarships, training and more from trusted employers across the country.

KaarYab (کاروب) connects Afghan talent with opportunities. It is a fully client-side Next.js application featuring a jobs explorer, company profiles with reviews, public applicant profiles, role-based dashboards, messaging, a career blog, and full multilingual support in English, Dari (فارسی) and Pashto (پښتو).

---

## Features

- **Opportunity explorer** — search and filter jobs across 10+ categories: remote, on-site, scholarship, internship, volunteer, training, course, freelance, competition, and fellowship.
- **Company profiles** — browse trusted employers with ratings, reviews, galleries, and follow functionality.
- **Applicant profiles** — public portfolio pages with skills, experience, education, projects, and certificates.
- **Role-based dashboards** — dedicated workspaces for applicants, employers, and admins, including application tracking and interview scheduling.
- **Messaging** — real-time-style conversations between applicants and employers.
- **Career blog** — articles and guides with dynamic slugs and static generation.
- **i18n** — full UI translations for English, Dari, and Pashto with RTL layout support.
- **Theming** — light/dark mode with system preference detection.
- **Job alerts** — newsletter signup and personalized notifications.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router, TypeScript) |
| UI | [React](https://react.dev) 19, [Tailwind CSS](https://tailwindcss.com) v4 |
| Motion | [framer-motion](https://www.framer.com/motion/) |
| Charts | [Recharts](https://recharts.org/) |
| Forms | [react-hook-form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons | [lucide-react](https://lucide.dev/) |
| Data | Client-side store seeded with realistic demo data, persisted to `localStorage` |

> **Note:** This is a front-end demo/prototype. Authentication, user data, and all records are stored in the browser's `localStorage`. It is not wired to a backend and should not be used to handle sensitive or real production data.

## Getting Started

### Prerequisites

- Node.js 20.9+ (Node 22 recommended)
- npm

### Installation

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

### Type checking

```bash
npx tsc --noEmit
```

## Demo Accounts

Use the built-in demo accounts (also shown on the login page):

| Role | Email | Password |
| --- | --- | --- |
| Applicant | `ahmad@example.com` | `demo1234` |
| Employer | `hamed@netlinks.af` | `demo1234` |
| Admin | `admin@kaaryab.af` | `admin1234` |

## Project Structure

```
src/
├── app/                  # App Router pages and route groups
│   ├── (auth)/           # Login, register, verify-email, forgot-password
│   ├── blog/             # Career blog (list + dynamic posts)
│   ├── companies/        # Company directory and profiles
│   ├── dashboard/        # Role-based dashboards
│   ├── jobs/             # Job explorer and detail pages
│   ├── messages/         # Employer–applicant conversations
│   ├── profile/          # Profile editor
│   └── u/[id]/           # Public applicant profiles
├── components/           # Reusable UI and feature components
│   ├── auth/             # Authentication forms and shell
│   ├── dashboard/        # Applicant / employer / admin dashboards
│   ├── home/             # Landing page sections
│   ├── jobs/             # Job cards, modals, and details
│   ├── layout/           # Navbar, footer, theme and language toggles
│   ├── profile/          # Public profile and editor
│   └── ui/               # Design-system primitives (Button, Input, etc.)
├── hooks/                # Shared React hooks
├── i18n/                 # Translation dictionaries (en, fa, ps)
├── lib/                  # Types, utilities, and seed data
├── providers/            # Client-side context providers (auth, data, i18n, theme)
```

## Environment Variables

None required. The application is fully self-contained and runs without external services or API keys.

## Deployment on Vercel

The project is configured for zero-config deployment on [Vercel](https://vercel.com).

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Vercel, choose **Add New → Project** and import the repository.
3. Vercel auto-detects Next.js — keep the defaults (build command: `npm run build`).
4. No environment variables are needed.
5. Click **Deploy**.

Local production check before pushing:

```bash
npm run build
```

### Notes for deployment

- The `.next/` folder is build output and is intentionally gitignored — Vercel regenerates it on every build.
- All routes are statically prerendered by default; dynamic routes (`/jobs/[id]`, `/companies/[slug]`, `/blog/[slug]`, `/u/[id]`) are server-rendered on demand.

