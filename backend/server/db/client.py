from server.settings import settings
from supabase import AsyncClient, acreate_client


class Database:
    _instance = None

    async def startup(cls) -> AsyncClient:
        _instance = await acreate_client(settings.supabase_url, settings.supabase_key)
        return _instance

    async def shutdown(cls) -> None:
        pass

    def client(cls) -> AsyncClient:
        if cls._instance is None:
            cls._instance = Database.startup()
        return cls._instance


# Initialize database class object
database = Database()
