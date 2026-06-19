# WCP — World Cup 2026 Predictions

Predict match outcomes for the 2026 FIFA World Cup.

## Project structure

```
WCP/
├── api/      # Vercel serverless API (production)
├── client/   # React + Vite frontend
├── lib/      # Shared storage helpers
├── server/   # Express API (local development)
├── vercel.json
└── README.md
```

## Prerequisites

- Node.js 18+
- npm

## Setup

### Backend

```bash
cd server
npm install
npm run dev
```

API runs at `http://localhost:3001`.

### Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/predictions` | List all predictions |
| POST | `/api/predictions` | Create a prediction |

### Example prediction payload

```json
{
  "matchId": "group-a-1",
  "homeTeam": "USA",
  "awayTeam": "Mexico",
  "predictedWinner": "USA",
  "confidence": 0.65
}
```

## Deploy on Vercel

This repo is configured for Vercel out of the box:

1. Go to [vercel.com/new](https://vercel.com/new) and import `maxalpizar97/WCP`.
2. Leave **Root Directory** as `.` (repo root) — `vercel.json` handles the build.
3. Click **Deploy**.

Vercel will build the React app from `client/` and deploy API routes from `api/`.

### Persistent predictions (recommended)

By default, predictions use in-memory storage on Vercel (data resets on cold starts). For persistence:

1. In your Vercel project, go to **Storage → Create Database → KV**.
2. Connect the KV store to the project — Vercel auto-sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`.
3. Redeploy.

## Git remote

```
https://github.com/maxalpizar97/WCP.git
```
