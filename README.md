# Senet - Cinematic Ancient Egyptian Board Game

A modern digital version of the ancient Egyptian board game Senet.

### Features
- **Online Multiplayer**: Real-time room-based matches over continuous WebSocket connections.
- **Cinematic UI**: High-fidelity graphics using the Royal style with "Inlaid Faience + Gold" materials, interactive source-target highlighting, dynamic physical throw-stick animations, and a **Spirit Ascension** game-over experience for a clear, fluid and premium gameplay experience.
- **Dynamic Chronicle**: Track game history with player-attributed logs and real-time event updates.
- **Rules Documentation**: Read history and gameplay strategies dynamically built into the user interface.
- **Multilingual Support**: Fully localized in English, Egyptian Arabic, and French.

## Running Locally (Development with Hot Reload)

1. Run `docker compose up --build`
2. Open `http://localhost:5173` for the frontend (with hot reload enabled)
3. The backend API is available via `http://localhost:8000/api`
