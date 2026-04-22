# MINIMA AI Production Architecture

This workspace is split into four clean layers:

1. Frontend UI in `client/`
2. AI orchestration API in `server/`
3. MiniMask adapter bridge in `client/src/services/minimask.js`
4. Minima blockchain access through MiniMask only

## Structure

```text
client/
  src/
    pages/
    components/
    services/
server/
  routes/
  services/
  middleware/
```

## Safety Rules

- The backend never sends funds.
- Every send intent requires confirmation before the frontend can call MiniMask.
- Raw MiniMask calls are isolated behind a single bridge service.

## Run

Install dependencies in each workspace, then run:

```bash
npm run dev:server
npm run dev:client
```

Set `VITE_API_URL` in the client if your API is not running at `http://localhost:4000`.

Create a local `.env` from `.env.example` when you want the frontend to talk to a specific backend origin.

Examples:

```bash
VITE_API_URL=http://localhost:4000
```

```bash
VITE_API_URL=https://your-backend.onrender.com
```

## Netlify Deploy

This repo can deploy on Netlify as a single site:

- Static frontend is published from `client/dist`
- API routes are served by `netlify/functions`
- In production, the frontend defaults to same-origin `/api/*`
- If you deploy the Node backend separately on Render/Railway, set `VITE_API_URL` to that deployed backend URL before building the frontend

The current `netlify.toml` is already set up for this flow.
