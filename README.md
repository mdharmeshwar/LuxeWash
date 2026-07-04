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
render.yaml
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

## Deploying to Render

This repository is ready for Render with a `render.yaml` blueprint.

### Why Render works well here

This app writes booking data to disk. On Render, local files are ephemeral by default, so a persistent disk is needed to keep appointments after restarts and deploys.

Render docs:

- Blueprint spec: https://render.com/docs/blueprint-spec
- Persistent disks: https://render.com/docs/disks
- Node + Express deploy guide: https://render.com/docs/deploy-node-express-app

### Render setup

1. Push this repository to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Connect the GitHub repository.
4. Render will detect `render.yaml`.
5. Create the service and let Render provision the persistent disk.

### Render runtime details

- build command: `npm run build`
- start command: `npm start`
- health check path: `/healthz`
- persistent disk mount path: `/var/data`

The app uses:

- `PORT` from Render automatically
- `NODE_ENV=production`
- `DATA_DIR=/var/data`

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
- For a larger production deployment, moving appointments into Postgres would be the natural next step.
