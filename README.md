# Surf Forecast Portugal

An MVP that ranks surf spots between Costa da Caparica and the Algarve, including the southwest and south coasts. It does not use a database: spots are defined in code, and forecasts come from the public Open-Meteo Marine and Weather APIs, with no API key required.

## Getting started

Requires Node.js 20 or later.

```bash
npm install
Copy-Item .env.example .env
npm run dev
```

Available endpoints:

The dashboard is available at `GET /` (by default at `http://localhost:5000/`).

- `GET /health`
- `GET /api/spots`
- `GET /api/recommendations/tomorrow`
- `GET /api/recommendations?days=5` (between 1 and 8 days)

The provider requests swell height, direction, and period from the Marine API, and wind at 10 m from the Weather API. Both queries use `cell_selection=sea` to select the nearest marine grid cell for each spot rather than a land grid cell.

To generate the daily report in the terminal:

```bash
npm run daily-report
```

## Daily notification

The job sends the report to the topic configured in `NTFY_TOPIC`. On Windows, the `Surf Forecast Daily Report` task runs daily at 07:00 (Lisbon time), provided the computer is on, connected to the internet, and the user is logged in. VS Code, the server, and the dashboard do not need to be open.

On your phone, install the ntfy app (or use `ntfy.sh/app`), subscribe to the topic name defined in `NTFY_TOPIC`, and enable notifications. Treat that name as a secret: do not share it.

## Next steps

1. Validate and fine-tune the rules for each spot in `src/config/spots.ts`.
2. Create a dashboard to compare trends and conditions across days.
