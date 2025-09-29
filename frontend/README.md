# Frontend

This project contains a TypeScript + React dashboard for visualising habit data provided by the Go backend that lives in the repository root. It is scaffolded around a Vite-style workspace with React Query for data fetching, Material UI for styling, and Recharts for visualisations.

## Getting started

1. **Install dependencies**
   ```bash
   npm install
   ```
   > If you are working offline, you can still run the unit tests (`npm test`). Browser development, however, requires the dependencies above.

2. **Start the development server**
   ```bash
   npm run dev
   ```

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Architecture overview

- `src/api/` — API clients, shared types, and a local-storage backed queue that caches responses and pending mutations.
- `src/hooks/` — The `useHabitData` hook orchestrates server state with React Query, handles optimistic updates, and performs offline reconciliation.
- `src/components/` — Presentation components including the 22×7 habit grid and dashboard widgets.
- `src/utils/` — Pure utilities for date formatting and summary/statistics calculations. These utilities are covered by Node-based unit tests under `tests/`.

## Offline strategy

The UI persists both the latest habit/completion snapshots and any pending checkbox toggles to `localStorage`. When the app detects that the browser has gone offline it keeps the UI responsive by applying optimistic updates and queues mutations locally. When connectivity returns, the queue is flushed and the React Query cache is refetched to reconcile with the server.

## API expectations

The dashboard expects the backend to expose the following endpoints:

- `GET /api/habits` → returns an array of habit objects (`{ id, name, targetPerWeek? }`).
- `GET /api/completions?start=<YYYY-MM-DD>&end=<YYYY-MM-DD>` → returns completion records for the requested range.
- `POST /api/completions/toggle` → accepts `{ habitId, date, completed }` to mark a checkbox.

The date range requested from the backend always spans the most recent 22 days to populate the 22 × 7 grid.
