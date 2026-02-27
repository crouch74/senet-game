# Senet - Cinematic Ancient Egyptian Board Game

A modern digital version of the ancient Egyptian board game Senet.

### Features
- **Online Multiplayer**: Real-time room-based matches over continuous WebSocket connections.
- **Cinematic UI**: High-fidelity graphics using the Royal style with "Inlaid Faience + Gold" materials, interactive source-target highlighting, dynamic physical throw-stick animations, and a **Spirit Ascension** game-over experience for a clear, fluid and premium gameplay experience.
- **Dynamic Chronicle**: Track game history with player-attributed logs and real-time event updates.
- **Legend & Instructions**: A collapsible "Tome of Knowledge" in the lobby providing mythic narrative, a visual key for sacred symbols, and a comprehensive gameplay guide.
- **Multilingual Support**: Fully localized in English, Egyptian Arabic, and French.

## Running Locally (Development with Hot Reload)

1. Run `docker compose up --build`
2. Open `http://localhost:5173` for the frontend (with hot reload enabled)
3. The backend API is available via `http://localhost:8000/api`

## GitHub Pages (Offline/Static Build)

1. In GitHub, open your repository settings:
   - `Settings` -> `Pages`
   - Under `Build and deployment`, set `Source` to `GitHub Actions`
2. Push to `main` (or run the `Deploy GitHub Pages` workflow manually).
3. Final URL pattern:
   - `https://<USER>.github.io/<REPO>/`
   - For this repo: `https://<USER>.github.io/senet-game/`
4. Base path configuration:
   - Production base path is derived from the repository name in CI.
   - Optional override: set `VITE_BASE_PATH` (example: `/senet-game/`).
5. Local static-output test:
   - Build Pages output: `cd client && npm run build:pages`
   - Serve built files as static output: `npx serve dist -s -l 4173`
