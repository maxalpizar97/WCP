# WCP — World Cup 2026 Predictions

Predict match outcomes for the 2026 FIFA World Cup.

## Project structure

```
WCP/
├── client/   # React + Vite frontend
├── server/   # Express API
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

## Git remote

```
https://github.com/maxalpizar97/WCP.git
```
