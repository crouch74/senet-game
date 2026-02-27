import logging
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os
import json
from typing import Dict

# Configure logging according to user rules
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Senet Game Backend")

# Log startup
@app.on_event("startup")
async def startup_event():
    logger.info("⚙️ [SYSTEM] Senet Backend Booting up")

# Store active websocket connections: roomId -> {"light": None | WebSocket, "dark": None | WebSocket}
active_rooms: Dict[str, Dict[str, WebSocket]] = {}

@app.websocket("/api/match/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    logger.info(f"🔌 [WS] New connection attempt for room {room_id}")
    
    if room_id not in active_rooms:
        active_rooms[room_id] = {"light": None, "dark": None}
        
    room = active_rooms[room_id]
    
    # Assign player color based on availability
    assigned_color = None
    if room["light"] is None:
        assigned_color = "light"
        room["light"] = websocket
    elif room["dark"] is None:
        assigned_color = "dark"
        room["dark"] = websocket
    else:
        # Room is full
        logger.warning(f"🚫 [WS] Connection to room {room_id} rejected. Room full.")
        await websocket.send_json({"type": "error", "message": "Room is full"})
        await websocket.close()
        return

    logger.info(f"🎭 [WS] Player joined room {room_id} as {assigned_color}")
    await websocket.send_json({"type": "init", "player": assigned_color})

    try:
        while True:
            data = await websocket.receive_text()
            
            # Forward the message to the other player in the room
            other_color = "dark" if assigned_color == "light" else "light"
            other_ws = room[other_color]
            
            if other_ws:
                await other_ws.send_text(data)

    except WebSocketDisconnect:
        logger.info(f"💔 [WS] Player {assigned_color} disconnected from room {room_id}")
        room[assigned_color] = None
        
        # Cleanup room if empty
        if room["light"] is None and room["dark"] is None:
            del active_rooms[room_id]
            logger.info(f"🧹 [WS] Room {room_id} closed")
        else:
            # Notify the other player that their opponent disconnected
            other_color = "dark" if assigned_color == "light" else "light"
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
