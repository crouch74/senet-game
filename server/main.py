import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Configure logging according to user rules
logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Senet Game Backend")

# Log startup
@app.on_event("startup")
async def startup_event():
    logger.info("⚙️ [SYSTEM] Senet Backend Booting up")

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
