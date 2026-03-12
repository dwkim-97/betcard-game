# BetCard Game

## Tech Stack
- Next.js 16 (App Router) + React + TypeScript + Tailwind CSS
- Supabase (PostgreSQL + Realtime) for backend
- Deployed on Vercel (free tier)

## Architecture
- Game logic: `src/game/` (pure functions, no side effects)
- API routes: `src/app/api/match/` (server-authoritative)
- Client hooks: `src/hooks/` (state management, realtime)
- UI components: `src/components/game/` (mobile-first)

## Key Rules
- All game logic runs server-side in API routes
- Never expose: opponent's bet, card values, result values, used cards
- R1-R2: reveal received card COLOR only; R3/SD: completely blind
- Non-zero constants go in `src/consts/`

## Setup
1. Create free Supabase project at https://supabase.com
2. Run `supabase/schema.sql` in Supabase SQL Editor
3. Copy `.env.local.example` to `.env.local` and fill in Supabase credentials
4. `npm run dev`
