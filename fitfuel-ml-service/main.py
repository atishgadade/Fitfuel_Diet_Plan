from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from routes import recommend_direct, macros, health
from utils.helpers import ModelNotLoadedError, FirebaseConnectionError
import logging
from config import ML_SERVICE_PORT

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="FIT-FUEL ML Service",
    description="Intelligent 7-Layer Diet Recommendation Engine",
    version="1.0.0"
)

# CORS setup for local proxy configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handlers
@app.exception_handler(ModelNotLoadedError)
async def model_not_loaded_handler(request: Request, exc: ModelNotLoadedError):
    logger.error(f"Execution blocked: {str(exc)}")
    return JSONResponse(status_code=503, content={"error": str(exc), "suggestion": "Run offline model training."})

@app.exception_handler(FirebaseConnectionError)
async def firebase_connection_handler(request: Request, exc: FirebaseConnectionError):
    logger.error(f"Database blocked: {str(exc)}")
    return JSONResponse(status_code=500, content={"error": str(exc)})

# Router Mounting
app.include_router(recommend_direct.router, prefix="/api", tags=["Recommendation"])
app.include_router(macros.router, prefix="/api", tags=["NLP Extraction"])
app.include_router(health.router, prefix="/api", tags=["System Health"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=ML_SERVICE_PORT, reload=True)
