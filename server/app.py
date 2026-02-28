from __future__ import annotations

from typing import Dict, Optional

from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .config import AppConfig, get_app_config
from .logging_utils import configure_logging, get_logger, log_event
from .room_registry import RoomRegistry
from .room_service import RoomService
from .websocket_handler import handle_match_websocket

configure_logging()
logger = get_logger(__name__)
SUPPORTED_GAMES = {"senet", "mehen"}


def create_app(
    registry: Optional[RoomRegistry] = None,
    room_service: Optional[RoomService] = None,
    config: Optional[AppConfig] = None,
) -> FastAPI:
    registry = registry or RoomRegistry()
    room_service = room_service or RoomService(registry)
    config = config or get_app_config()

    app = FastAPI(title="Senet Game Backend")
    app.state.config = config
    app.state.room_registry = registry
    app.state.room_service = room_service

    @app.on_event("startup")
    async def startup_event() -> None:
        log_event(logger, "✅", "SYSTEM", "Senet Backend Booting up")

    @app.post("/api/match/create")
    def create_room(game: str = "senet") -> Dict[str, str]:
        if game not in SUPPORTED_GAMES:
            raise HTTPException(status_code=400, detail="Unsupported game type")
        room_id = room_service.create_room(game_type=game)
        log_event(logger, "✅", "REST", f"Created new {game} room {room_id}")
        return {"room_id": room_id}

    @app.websocket("/api/match/{room_id}")
    async def websocket_endpoint(websocket: WebSocket, room_id: str) -> None:
        await handle_match_websocket(
            websocket,
            room_id,
            registry,
            room_service,
            logger,
        )

    @app.get("/api/health")
    def health_check() -> Dict[str, str]:
        log_event(logger, "🔍", "HEALTH", "Health check requested")
        return {"status": "ok"}

    if config.has_static_client:
        app.mount(
            "/assets",
            StaticFiles(directory=str(config.client_assets)),
            name="assets",
        )

        @app.get("/{full_path:path}")
        async def serve_react_app(full_path: str) -> FileResponse:
            return FileResponse(config.client_index)

    else:
        log_event(
            logger,
            "⚠️",
            "SYSTEM",
            "Static client build not found, serving API only.",
        )

        @app.get("/")
        def root() -> Dict[str, str]:
            return {"message": "Senet API is running. Client build not found."}

    return app
