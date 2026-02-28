# Senet

[![CI](https://github.com/crouch74/senet-game/actions/workflows/ci.yml/badge.svg)](https://github.com/crouch74/senet-game/actions/workflows/ci.yml)
[![GitHub Pages](https://github.com/crouch74/senet-game/actions/workflows/pages.yml/badge.svg)](https://github.com/crouch74/senet-game/actions/workflows/pages.yml)
![React](https://img.shields.io/badge/frontend-React%2019-20232a?logo=react)
![FastAPI](https://img.shields.io/badge/backend-FastAPI-05998b?logo=fastapi)
![Docker](https://img.shields.io/badge/dev-Docker%20Compose-2496ed?logo=docker)

A modern digital adaptation of the ancient Egyptian board game Senet. The project combines a cinematic React frontend with a FastAPI backend for room-based online matches, while still supporting local offline play.

## Highlights

- Real-time multiplayer using WebSockets and short shareable room codes
- Offline play against local turn logic and computer-assisted turns
- Cinematic board presentation with animated throw sticks, themed artwork, and a game-over sequence
- Chronicle and rules panels that keep match history and rules context visible during play
- Localization support for English, Egyptian Arabic, and French
- Static frontend build support for GitHub Pages deployments

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Zustand, i18next, Vitest
- Backend: FastAPI, Uvicorn, websockets, pytest
- Dev environment: Docker Compose for hot-reload frontend and backend containers

## Repository Layout

```text
client/   React + TypeScript frontend
server/   FastAPI app, room management, WebSocket protocol, backend tests
.github/  CI and GitHub Pages workflows
```

## Getting Started

### Option 1: Docker Compose

This is the fastest way to run both services with hot reload.

```bash
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`
- Health check: `http://localhost:8000/api/health`

### Option 2: Run Services Directly

Frontend:

```bash
cd client
npm ci
npm run dev
```

Backend:

```bash
python -m venv .venv
.venv/bin/pip install -r server/requirements-dev.txt
.venv/bin/uvicorn server.main:app --reload --host 0.0.0.0 --port 8000
```

## Development Commands

Frontend:

```bash
cd client
npm run lint
npm run test
npm run test:coverage
npm run build
```

Backend:

```bash
.venv/bin/pytest server/tests
.venv/bin/pytest --cov=server --cov-branch server/tests
```

## Gameplay and App Features

- Create an online room from the lobby and share the generated room code
- Join a live match over `/api/match/{room_id}` WebSocket sessions
- Track move history in the in-game chronicle
- Review rule summaries and guidance from the integrated help surfaces
- Switch between supported languages in the UI

## Deployment

### GitHub Pages Frontend

The repository includes a GitHub Actions workflow that builds and deploys the static frontend to GitHub Pages on pushes to `main`.

- Workflow: `Deploy GitHub Pages`
- Production base path is set from the repository name in CI
- Optional override: `VITE_BASE_PATH=/senet-game/`

To test the Pages build locally:

```bash
cd client
npm ci
npm run build:pages
npx serve dist -s -l 4173
```

### Backend

The FastAPI backend serves the API and WebSocket endpoints. In environments where a built client is present, it can also serve the frontend assets.

Primary endpoints:

- `POST /api/match/create`
- `GET /api/health`
- `WS /api/match/{room_id}`

## Quality Checks

The `CI` workflow runs on pushes to `main` and pull requests, and currently verifies:

- frontend dependency install
- frontend linting
- frontend test coverage
- frontend production build
- backend test coverage
