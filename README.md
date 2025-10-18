# NeoQik Reverse ETA

NeoQik Reverse ETA is a Cloudflare Pages application that calculates and visualises reverse estimated time of arrival (ETA) for Korean express bus routes. The project combines a React + Vite single page application with Cloudflare Pages Functions, using lightweight JSON files as the backing datastore and proxying third-party APIs (Naver Maps, JUSO).

## Features

- 🔍 Address lookup backed by the Korean JUSO API (proxied through Cloudflare Pages Functions).
- 🚌 ETA computation based on curated express bus schedule, route, and terminal JSON datasets.
- 🗺️ Route visualisation on Naver Maps with polylines and timeline breakdown.
- 🛠️ Admin view to inspect loaded routes, terminals, and schedules without direct database access.
- 🧰 Python migration script that converts Excel source files into the JSON data used by the app.

## Getting started

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)
- Optional: Python 3.10+ with `pandas` and `openpyxl` if you want to regenerate the JSON seed files from Excel.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The development server runs at <http://localhost:5173>. Cloudflare Pages Functions are emulated automatically through Vite's proxy configuration.

### Building

```bash
npm run build
```

The bundled assets are produced in the `dist` directory, ready to be deployed to Cloudflare Pages.

### Linting (optional)

```bash
npm run typecheck
```

## Environment variables

Set the following variables in your Cloudflare Pages project settings under **Environment Variables**. The development server reads them from `.env.local` (which should *not* be committed). Only the backend Cloudflare Functions use these secrets.

- `JUSO_API_KEY`
- `NAVER_CLIENT_ID`
- `NAVER_CLIENT_SECRET`

## Project structure

```
public/
  favicon.svg
  manifest.json
src/
  client/
    components/
    pages/
    main.tsx
    styles.css
  db/
    db.ts
    migrate.py
    schema.sql
    seed/
  functions/
    api/
      bus.ts
      direction.ts
      eta.ts
      geo.ts
      health.ts
  shared/
    constants.ts
    types.ts
    utils.ts
```

## Cloudflare deployment

`wrangler.toml` is configured for Cloudflare Pages. The important bits are:

- Build command: `npm run build`
- Build output: `dist`
- Functions directory: `src/functions`

To deploy:

1. Push the repository to GitHub.
2. Create a new Cloudflare Pages project and connect the repository.
3. Set the environment variables listed above.
4. Trigger a deployment.

## Data migration

If you obtain updated Excel sheets (`terminals.xlsx`, `express_schedules_with_coords.xlsx`), run the migration script to regenerate JSON datasets:

```bash
cd src/db
python migrate.py
```

The script will output `terminals.json`, `routes.json`, and `schedules.json` in the `seed/` directory.

## License

MIT
