# SupportX Frontend — Phase 1 (Auth Foundation)

## What's included
- Vite + React 18 project setup
- Design system (`src/index.css`) — navy/blue corporate theme, Space Grotesk + Inter
- `AuthContext` — login, register, logout, persisted session
- `api.js` — Axios instance that auto-attaches your JWT to every request
- `ProtectedRoute` — redirects to `/login` if not signed in
- Login and Register pages, fully wired to your backend
- Basic Navbar shown once signed in

## Setup

1. `cd frontend`
2. `npm install`
3. Copy `.env.example` to `.env` — the default `http://localhost:5000/api` will work as long as your backend is running on port 5000
4. Make sure your **backend** is running first (`npm run dev` in the backend folder)
5. `npm run dev`
6. Open the URL it prints (usually `http://localhost:5173`)

## Try it
1. Go to `/register`, create an account (pick "Admin" if you want to test admin-only features later)
2. You'll land on a simple welcome screen — the real dashboard/ticket views come in the next build
3. Log out, then log back in via `/login` to confirm the session persists

## Known simplification
Register doesn't ask for a department yet — that gets assigned properly from the admin's Employees page in a later phase. For now, registered employees have no department until you (or the admin API) assign one.

## What's next
- Employee pages: My Tickets, Ticket Detail + comments, My Performance, Leaderboard
- Admin pages: Dashboard with charts, Create Ticket, All Tickets, Departments, Employees, AI Reports
- Landing/home page polish
