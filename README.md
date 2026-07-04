# LuxeWash

LuxeWash is a full-stack car wash appointment system built with React, TypeScript, Vite, and Express. It includes a customer-facing booking flow, a live appointment status lookup, and an internal dashboard for updating and managing bookings.

## Highlights

- clean REST API for services and appointments
- multi-step booking flow with inline validation
- live status lookup by appointment details
- dashboard for updating and deleting bookings
- file-based persistence for simple local setup

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- Tailwind CSS
- Lucide icons

## Project Structure

```text
src/
  features/
    booking/
    dashboard/
    landing/
    status/
  shared/
    types.ts
    ui/
server.ts
appointments.json
```

## Local Development

### Prerequisites

- Node.js 20 or later
- npm

### Install

```bash
npm install
```

### Run the app

```bash
npm run dev
```

The app starts on `http://localhost:3000`.

## Available Scripts

- `npm run dev` starts the Express server in development mode
- `npm run build` builds the frontend and bundles the server for production
- `npm run start` runs the production build from `dist/server.js`
- `npm run lint` runs the TypeScript type check

## Data Storage

Appointments are stored in `appointments.json` by default.

For local development, this keeps setup simple. For hosted environments, the app can store the same file in a mounted persistent disk by setting the `DATA_DIR` environment variable.

## Deploying to Render on the Free Plan

This project can be deployed on Render as a free **Web Service**.

### Important note about storage

This app currently stores bookings in `appointments.json`.

On Render's free plan, the filesystem is ephemeral. That means the app can run, but any appointment data may be lost after a restart, rebuild, or redeploy.

That is fine for:

- demos
- practice
- UI review
- portfolio use

It is not reliable for long-term persistent booking data.

### Manual Render setup

1. Push this repository to GitHub.
2. In Render, click **New +**.
3. Choose **Web Service**.
4. Connect the GitHub repository.
5. Select the `main` branch.
6. Use these settings:

- Runtime: `Node`
- Build Command:

```bash
npm install --include=dev && npm run build
```

- Start Command:

```bash
NODE_ENV=production npm start
```

### Environment settings

Do not set `NODE_ENV=production` in the Render environment variable panel for the free-plan build step.

If needed, add:

- `NPM_CONFIG_PRODUCTION=false`

This makes sure Render installs `devDependencies` like `vite` and `esbuild`, which are required for the build command.

### Health check

Use:

- `/healthz`

### Render runtime details

- `PORT` is provided automatically by Render
- `NODE_ENV=production` is applied in the start command

## API Overview

### Services

- `GET /api/services`

### Appointments

- `GET /api/appointments`
- `GET /api/appointments/:id`
- `POST /api/appointments`
- `PUT /api/appointments/:id`
- `DELETE /api/appointments/:id`

### Health

- `GET /healthz`

## Notes

- The current persistence model is file-based for simplicity.
- On Render free plan, appointment data is not durable.
- For a more production-friendly free deployment, moving appointments into Supabase, Neon, or another hosted database would be the natural next step.
