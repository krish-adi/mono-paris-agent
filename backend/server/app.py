from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.routes import router
from contextlib import asynccontextmanager
from server.settings import settings
from server.db.client import database
import logfire


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup events
    load_dotenv(".env")
    settings.load_settings()
    await database.startup()
    logfire.configure(token=settings.logfire_token)
    logfire.instrument_anthropic()
    logfire.info("Hello, {place}!", place="irreplaceable-server")
    yield
    # Shutdown events
    await database.shutdown()
    logfire.info("Goodbye, {place}!", place="irreplaceable-server")


app = FastAPI(lifespan=lifespan)
logfire.instrument_fastapi(app, capture_headers=True)

# Configure CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(router)
