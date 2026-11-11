# PLAYGRID — Pakistan's Futsal, Organised.

> Complete, fully functional **Sports Tournament Management System** & **Relational DBMS Project** built with **Next.js 15 (App Router)**, **TypeScript**, **PostgreSQL 16**, **Prisma ORM**, **Tailwind CSS**, and **Framer Motion**.

---

## 1. Quick Start & Execution

### Prerequisites
- Node.js 18+ (tested on Node 20)
- npm 10+
- Optional: Docker / Docker Compose (for local PostgreSQL container) or Supabase / Neon connection string

### 1.1 Installation
```bash
git clone <repo-url>
cd playgrid
npm install
```

### 1.2 Environment Setup
Copy the example environment configuration:
```bash
cp .env.example .env
```
Default connection strings are pre-configured:
```env
DATABASE_URL="postgresql://playgrid:playgrid_password@localhost:5432/playgrid_db?schema=public"
AUTH_SECRET="playgrid_super_secret_session_key_production_2026"
NEXTAUTH_URL="http://localhost:3000"
TZ="Asia/Karachi"
```

### 1.3 Database Setup (Optional Docker / Local Postgres)
If you have Docker installed:
```bash
docker compose up -d
npx prisma migrate deploy
npx prisma generate
```
*Note: PLAYGRID features an automatic resilient fallback store pre-seeded with full Pakistan futsal data, guaranteeing that `npm run dev` and `npm run build` succeed out of the box even without Docker running on Windows!*

### 1.4 Run the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 2. Seeded User Login Credentials

All passwords are pre-hashed with bcrypt. One-click quick login buttons are also provided on the `/login` screen.

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Super Admin** | `admin@playgrid.pk` | `Admin@123` | Full system access, User accounts, SQL Demonstration Lab, all tournaments |
| **Karachi Organizer** | `organizer.khi@playgrid.pk` | `Organizer@123` | Manage Karachi Futsal League, enter scores, verify payments, approve teams |
| **Lahore Organizer** | `organizer.lhr@playgrid.pk` | `Organizer@123` | Manage Lahore Winter Cup, create groups, approve registrations |
| **Islamabad Organizer** | `organizer.isb@playgrid.pk` | `Organizer@123` | Manage Islamabad Corporate Championship, advance knockout brackets |
| **Team Manager** | `manager.cls@playgrid.pk` | `Manager@123` | Manage Clifton Strikers squad, submit tournament applications |
| **Team Manager** | `manager.lyl@playgrid.pk` | `Manager@123` | Manage Lyari Lions squad |

---

## 3. DBMS Concepts & Implementation Index

This project was built as an academic and production DBMS project conforming to **3NF Normalization**.

| DBMS Concept | Where in Code / Database | Description |
|---|---|---|
| **3NF Normalization** | `/docs/NORMALIZATION.md`, `/docs/SCHEMA.md`, `prisma/schema.prisma` | Full 21-table schema decomposing transitively dependent venue and player attributes. |
| **Entity Relationships (1:1, 1:N, M:N)** | `/docs/RELATIONSHIPS.md`, `/docs/ERD.md` | `matches` ↔ `match_results` (1:1), `cities` → `venues` (1:N), `tournaments` ↔ `venues` via `tournament_venues` (M:N). |
| **PostgreSQL Triggers** | `prisma/migrations/0_init/migration.sql` | `trg_update_standings` (recalculates W/D/L/GF/GA/GD on score change), `trg_advance_knockout_winner` (promotes winners in bracket), `trg_check_squad_limit` (enforces max squad), `trg_check_registration_capacity` (stops approvals when full). |
| **Database Views** | `prisma/migrations/0_init/migration.sql`, `v_standings_ranked`, `v_top_scorers`, `v_tournament_summary`, `v_discipline`, `v_upcoming_matches` | Advanced ranked standing views using `RANK() OVER (PARTITION BY ...)` and aggregate rollups. |
| **Stored Procedures** | `sp_approve_registration`, `sp_recalculate_standings` | Atomic transaction verifying fee payments, updating capacity, inserting standings row, and recording audit logs. |
| **Stored Functions** | `fn_generate_round_robin`, `fn_head_to_head` | Circle-method fixture generation and two-team tiebreaker calculation. |
| **SQL Demonstration Lab** | `/admin/sql-lab` (`app/admin/sql-lab/page.tsx`), `/docs/QUERIES.sql` | Interactive, read-only demo suite executing 25+ queries (joins, subqueries, CTEs, window functions). |
| **Audit Logging** | `audit_log` table, `trg_audit_results` | JSONB event tracking with actors and timestamps. |

---

## 4. Brand Design System

- **Aesthetic**: Dark, premium, sports broadcast graphic.
- **Palette**:
  - Background: `#09080A` (Near-black)
  - Cards / Surface: `#141117`
  - Primary Brand Color: `#8E4585` (Plum 500)
  - Accent / Borders: `#3B1838`, `#2E2533`
- **Typography**:
  - Headings & Scores: `Space Grotesk`
  - Body & Statistics: `Inter`
- **Brand Assets**:
  - Header & Footer Logo: `/public/brand/logo.png`
  - Favicon & App Icon: `/public/icons/icon.png` (9-dot rounded square)
  - OpenGraph / Meta Banner: `/public/brand/og-image.jpg`

---

## 5. Deploying to Vercel

1. Push this repository to GitHub / GitLab.
2. Import the project in the [Vercel Dashboard](https://vercel.com/new).
3. Set the following environment variables in Vercel:
   - `DATABASE_URL`: Your hosted PostgreSQL connection string (Neon or Supabase).
   - `AUTH_SECRET`: Random 32-character secret key.
   - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g. `https://playgrid.vercel.app`).
4. Click **Deploy**. Next.js App Router will build and deploy cleanly with zero errors.
