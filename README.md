# WCP — World Cup 2026 Predictions

Enterprise-grade World Cup predictions platform with historical data from 1930–2026.

## Data sources (free)

| Source | Data | License |
|--------|------|---------|
| [Fjelstul World Cup DB](https://github.com/jfjelstul/worldcup) | 1,248 matches, 88 teams (1930–2022) | CC-BY-NC-SA |
| [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json) | 2018, 2022, 2026 fixtures | Public domain |
| [WorldCups.ai](https://www.worldcups.ai/) | Same Fjelstul dataset | CC-BY-NC-SA |

Refresh data:
```bash
# PowerShell
.\scripts\ingest-history.ps1

# Node.js
node scripts/ingest-history.js
```

## Project structure

```
WCP/
├── api/           # Vercel serverless API
├── client/        # React + Tailwind frontend
├── data/          # Pre-processed historical JSON
├── lib/           # Storage + history helpers
├── scripts/       # Data ingestion
├── server/        # Express API (local dev)
└── vercel.json
```

## Local development

```bash
# API (port 3001)
cd server && npm install && npm run dev

# Frontend (port 5173)
cd client && npm install && npm run dev
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Dashboard KPIs |
| GET | `/api/tournaments` | List all tournament years |
| GET | `/api/tournaments?year=2022` | Matches for a year |
| GET | `/api/tournaments?upcoming=true` | 2026 fixtures |
| GET | `/api/head-to-head?team1=&team2=` | H2H history |
| GET | `/api/teams?name=Brazil` | Team profile + recent matches |
| GET | `/api/teams?q=bra` | Team search |
| GET/POST | `/api/predictions` | User predictions |

## Deploy on Vercel

1. Import `maxalpizar97/WCP` at [vercel.com/new](https://vercel.com/new)
2. Root directory: `.` (repo root)
3. Deploy — `vercel.json` handles build config

Optional: add Vercel KV for persistent predictions.

## Git remote

```
https://github.com/maxalpizar97/WCP.git
```
