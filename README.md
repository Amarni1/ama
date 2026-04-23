# MINIMA AI Treasury Swap DEX

This workspace now runs as a treasury-backed swap dashboard rather than an orderbook DEX.

## Architecture

1. `client/` contains the premium React swap dashboard
2. `server/` exposes the AI orchestration and treasury swap API
3. `client/src/services/minimask.js` is the MiniMask + MEG bridge for wallet access, sendable balances, deposits, and tx checks
4. `server/routes/swaps.js` handles quotes, swap requests, status polling, and history

## Swap Flow

1. The user requests a quote
2. The backend creates a swap request for the treasury route
3. The frontend sends the source token to the treasury wallet through MiniMask
4. The backend verifies the deposit tx on-chain
5. The backend calls the treasury payout service
6. The UI shows `Submitted -> Processing -> Success` as confirmations arrive

## Run

Install dependencies at the workspace root, then run:

```bash
npm run dev:server
npm run dev:client
```

Default local URLs:

- Frontend: `http://localhost:5173`
- API: `http://localhost:4000`

## Environment

Create a local `.env` from `.env.example`.

Required backend variables for a live swap route:

- `TREASURY_ADDRESS`
- `MINIMA_CHAIN_API_URL`
- `TREASURY_PAYOUT_URL`
- token ids for any non-Minima assets you want to settle

The frontend only needs `VITE_API_URL` when the API is hosted separately from the UI.

## Deployment Notes

- The React frontend can be hosted on Netlify or Vercel
- The backend must run on a long-lived Node host such as Render, Railway, or Fly.io
- A real production swap requires a treasury payout service that can submit Minima transactions after deposit verification
