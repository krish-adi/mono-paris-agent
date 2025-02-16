from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routes import router
from contextlib import asynccontextmanager
from server.settings import settings
from server.db.client import database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup events
    load_dotenv(".env")
    settings.load_settings()
    await database.startup()
    yield
    # Shutdown events
    await database.shutdown()


app = FastAPI(lifespan=lifespan)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)
