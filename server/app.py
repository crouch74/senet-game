from __future__ import annotations

import json
import logging
import os
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .room_registry import RoomRegistry
from .room_service import GameStartBroadcast, RoomAssignmentError, RoomService

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


def create_app(
    registry: Optional[RoomRegistry] = None,
    room_service: Optional[RoomService] = None,
) -> FastAPI:
    registry = registry or RoomRegistry()
    room_service = room_service or RoomService(registry)

    app = FastAPI(title="Senet Game Backend")
    app.state.room_registry = registry
    app.state.room_service = room_service

    @app.on_event("startup")
    async def startup_event():
        logger.info("⚙️ [SYSTEM] Senet Backend Booting up")

    @app.post("/api/match/create")
    def create_room():
        room_id = room_service.create_room()
        logger.info(f"🏠 [REST] Created new room {room_id}")
        return {"room_id": room_id}

    @app.websocket("/api/match/{room_id}")
    async def websocket_endpoint(websocket: WebSocket, room_id: str):
        await websocket.accept()
        logger.info(f"🔌 [WS] New connection attempt for room {room_id}")

        try:
            assigned_role = room_service.assign_role(room_id, websocket)
        except RoomAssignmentError as exc:
            logger.warning(
                f"🚫 [WS] Connection to room {room_id} rejected. {exc}."
            )
            await websocket.send_json({"type": "error", "message": str(exc)})
            await websocket.close()
            return

        if assigned_role == "spectator":
            logger.info(f"👁️ [WS] Spectator joined room {room_id}")
            await websocket.send_json({"type": "init", "role": assigned_role})
            await websocket.send_json({"type": "game_start"})
            latest_state = room_service.get_latest_state(room_id)
            if latest_state is not None:
                await websocket.send_json({"type": "sync", "state": latest_state})
        else:
            logger.info(f"🎭 [WS] Player joined room {room_id} as {assigned_role}")
            await websocket.send_json({"type": "init", "player": assigned_role})

        broadcast = room_service.build_game_start_broadcast(room_id)
        if broadcast is not None:
            if broadcast.rolls is not None and broadcast.opening_player is not None:
                logger.info(
                    f"🎲 [WS] Opening roll-off for room {room_id}: "
                    f"anubis={broadcast.rolls['anubis']}, "
                    f"sphinx={broadcast.rolls['sphinx']}, "
                    f"starter={broadcast.opening_player}"
                )
            else:
                logger.info(f"⚔️ [WS] Room {room_id} resumed — broadcasting game_start")

            for recipient in room_service.get_room_recipients(room_id):
                try:
                    await recipient.send_json(broadcast.payload)
                except Exception:
                    pass

        try:
            while True:
                data = await websocket.receive_text()
                if assigned_role == "spectator":
                    continue

                try:
                    parsed = json.loads(data)
                except json.JSONDecodeError:
                    parsed = None

                if isinstance(parsed, dict) and parsed.get("type") == "sync":
                    state = parsed.get("state")
                    if isinstance(state, dict):
                        room_service.store_latest_state(room_id, state)

                    stale_spectators = []
                    for recipient in room_service.get_sync_recipients(room_id, assigned_role):
                        try:
                            await recipient.send_text(data)
                        except Exception:
                            stale_spectators.append(recipient)
                    for stale_spectator in stale_spectators:
                        room_service.discard_spectator(room_id, stale_spectator)
                    continue

                other_ws = room_service.get_opponent_socket(room_id, assigned_role)
                if other_ws is not None:
                    await other_ws.send_text(data)

        except WebSocketDisconnect:
            room_service.mark_disconnected(room_id, assigned_role, websocket)

            if assigned_role == "spectator":
                logger.info(f"💔 [WS] Spectator disconnected from room {room_id}")
            else:
                logger.info(
                    f"💔 [WS] Player {assigned_role} disconnected from room {room_id}"
                )

            if room_service.is_empty(room_id):
                registry.delete_room(room_id)
                logger.info(f"🧹 [WS] Room {room_id} closed")
            elif assigned_role in ("anubis", "sphinx"):
                other_ws = room_service.get_opponent_socket(room_id, assigned_role)
                if other_ws is not None:
                    try:
                        await other_ws.send_json({"type": "opponent_disconnected"})
                    except Exception:
                        pass

    @app.get("/api/health")
    def health_check():
        logger.info("🩺 [HEALTH] Health check requested")
        return {"status": "ok"}

    client_dist = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "client",
        "dist",
    )

    if os.path.exists(client_dist):
        app.mount(
            "/assets",
            StaticFiles(directory=os.path.join(client_dist, "assets")),
            name="assets",
        )

        @app.get("/{full_path:path}")
        async def serve_react_app(full_path: str):
            return FileResponse(os.path.join(client_dist, "index.html"))

    else:
        logger.warning("⚠️ [SYSTEM] Static client build not found, serving API only.")

        @app.get("/")
        def root():
            return {"message": "Senet API is running. Client build not found."}

    return app
