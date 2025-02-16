from server.settings import settings
from supabase import AsyncClient, acreate_client


class Database:
    def __init__(self):
        self._instance: AsyncClient = None

    async def startup(self) -> AsyncClient:
        self._instance = await acreate_client(
            settings.supabase_url, settings.supabase_key
        )
        print("Database initialized")
        return self._instance

    async def shutdown(self) -> None:
        pass

    def client(self) -> AsyncClient:
        # if self._instance is None:
        #     self._instance = await self.startup()
        if self._instance is None:
            raise Exception("Database not initialized")

        return self._instance


# Initialize database class object
database = Database()
