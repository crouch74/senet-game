import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import json
import random
import string
from typing import Any, Dict, Optional, Set, TypedDict

# Configure logging according to user rules
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Senet Game Backend")

# Log startup
@app.on_event("startup")
async def startup_event():
    logger.info("⚙️ [SYSTEM] Senet Backend Booting up")

class RoomState(TypedDict):
    anubis: Optional[WebSocket]
    sphinx: Optional[WebSocket]
    opening_player: Optional[str]
    spectators: Set[WebSocket]
    latest_state: Optional[Dict[str, Any]]

# Store active websocket connections and room metadata.
# roomId -> {"anubis": None | WebSocket, "sphinx": None | WebSocket, "opening_player": None | "anubis" | "sphinx", "spectators": set(), "latest_state": dict | None}
active_rooms: Dict[str, RoomState] = {}

@app.post("/api/match/create")
def create_room():
    while True:
        letters = ''.join(random.choices(string.ascii_lowercase, k=9))
        room_id = f"{letters[:3]}-{letters[3:6]}-{letters[6:]}"
        if room_id not in active_rooms:
            active_rooms[room_id] = {
                "anubis": None,
                "sphinx": None,
                "opening_player": None,
                "spectators": set(),
                "latest_state": None
            }
            logger.info(f"🏠 [REST] Created new room {room_id}")
            return {"room_id": room_id}

@app.websocket("/api/match/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    logger.info(f"🔌 [WS] New connection attempt for room {room_id}")
    
    if room_id not in active_rooms:
        logger.warning(f"🚫 [WS] Connection to room {room_id} rejected. Room does not exist.")
        await websocket.send_json({"type": "error", "message": "Room does not exist"})
        await websocket.close()
        return
    room = active_rooms[room_id]
    
    # Assign role. Once a game has started and both seats are occupied, late joiners are spectators.
    assigned_role: Optional[str] = None
    if room["opening_player"] is not None and room["anubis"] is not None and room["sphinx"] is not None:
        assigned_role = "spectator"
        room["spectators"].add(websocket)
        logger.info(f"👁️ [WS] Spectator joined room {room_id}")
        await websocket.send_json({"type": "init", "role": assigned_role})
        await websocket.send_json({"type": "game_start"})
        if room["latest_state"] is not None:
            await websocket.send_json({"type": "sync", "state": room["latest_state"]})
    elif room["anubis"] is None:
        assigned_role = "anubis"
        room["anubis"] = websocket
    elif room["sphinx"] is None:
        assigned_role = "sphinx"
        room["sphinx"] = websocket
    else:
        # Room is full but the game has not started yet.
        logger.warning(f"🚫 [WS] Connection to room {room_id} rejected. Room full.")
        await websocket.send_json({"type": "error", "message": "Room is full"})
        await websocket.close()
        return

    if assigned_role in ("anubis", "sphinx"):
        logger.info(f"🎭 [WS] Player joined room {room_id} as {assigned_role}")
        await websocket.send_json({"type": "init", "player": assigned_role})

    # If both seats are now filled, notify both players the game can start.
    if room["anubis"] is not None and room["sphinx"] is not None:
        opening_player = room["opening_player"]
        if opening_player is None:
            # Opening player is decided by roll-off. Re-roll ties until resolved.
            while True:
                anubis_roll = random.randint(1, 6)
                sphinx_roll = random.randint(1, 6)
                if anubis_roll != sphinx_roll:
                    break

            opening_player = "anubis" if anubis_roll > sphinx_roll else "sphinx"
            room["opening_player"] = opening_player
            logger.info(
                f"🎲 [WS] Opening roll-off for room {room_id}: anubis={anubis_roll}, sphinx={sphinx_roll}, starter={opening_player}"
            )
        else:
            anubis_roll = None
            sphinx_roll = None
            logger.info(f"⚔️ [WS] Room {room_id} resumed — broadcasting game_start")

        recipients = [room["anubis"], room["sphinx"], *room["spectators"]]
        for ws in recipients:
            try:
                payload = {"type": "game_start"}
                # Include starter only once so reconnects do not force-reset turns in active games.
                if anubis_roll is not None and sphinx_roll is not None and opening_player is not None:
                    payload = {
                        "type": "game_start",
                        "opening_player": opening_player,
                        "opening_rolls": {"anubis": anubis_roll, "sphinx": sphinx_roll}
                    }
                await ws.send_json(payload)
            except Exception:
                pass

    try:
        while True:
            data = await websocket.receive_text()
            if assigned_role == "spectator":
                # Spectators are read-only.
                continue

            parsed = None
            try:
                parsed = json.loads(data)
            except json.JSONDecodeError:
                parsed = None

            if isinstance(parsed, dict) and parsed.get("type") == "sync":
                state = parsed.get("state")
                if isinstance(state, dict):
                    room["latest_state"] = state

                # Broadcast sync updates to opponent + all spectators.
                recipients: list[WebSocket] = []
                other_color = "sphinx" if assigned_role == "anubis" else "anubis"
                other_ws = room[other_color]
                if other_ws:
                    recipients.append(other_ws)
                recipients.extend(room["spectators"])

                stale_spectators: list[WebSocket] = []
                for ws in recipients:
                    try:
                        await ws.send_text(data)
                    except Exception:
                        if ws in room["spectators"]:
                            stale_spectators.append(ws)
                for stale_ws in stale_spectators:
                    room["spectators"].discard(stale_ws)
                continue

            # Forward non-sync messages only to the opponent.
            other_color = "sphinx" if assigned_role == "anubis" else "anubis"
            other_ws = room[other_color]
            if other_ws:
                await other_ws.send_text(data)

    except WebSocketDisconnect:
        if assigned_role == "spectator":
            room["spectators"].discard(websocket)
            logger.info(f"💔 [WS] Spectator disconnected from room {room_id}")
        else:
            logger.info(f"💔 [WS] Player {assigned_role} disconnected from room {room_id}")
            room[assigned_role] = None
        
        # Cleanup room if empty
        if room["anubis"] is None and room["sphinx"] is None and len(room["spectators"]) == 0:
            del active_rooms[room_id]
            logger.info(f"🧹 [WS] Room {room_id} closed")
        elif assigned_role in ("anubis", "sphinx"):
            # Notify the other player that their opponent disconnected
            other_color = "sphinx" if assigned_role == "anubis" else "anubis"
            other_ws = room[other_color]
            if other_ws:
                try:
                    await other_ws.send_json({"type": "opponent_disconnected"})
                except Exception:
                    pass

# Define API routes here before mounting static files
@app.get("/api/health")
def health_check():
    logger.info("🩺 [HEALTH] Health check requested")
    return {"status": "ok"}

# Mount the React build directory
client_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "client", "dist")

if os.path.exists(client_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(client_dist, "assets")), name="assets")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Serve index.html for all other routes to let React Router handle them
        return FileResponse(os.path.join(client_dist, "index.html"))
else:
    logger.warning("⚠️ [SYSTEM] Static client build not found, serving API only.")
    @app.get("/")
    def root():
        return {"message": "Senet API is running. Client build not found."}
