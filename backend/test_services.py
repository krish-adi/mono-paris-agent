import dotenv
dotenv.load_dotenv()

from server.services.search import search_content
from server.services.perplexity import ask_perplexity

async def test_search():
    result = await search_content("test query")
    print("Search successful!")
    print(f"Search result: {result}")

async def test_perplexity():
    print("\nTesting perplexity service...")
    try:
        result = await ask_perplexity("What is Python programming language?")
        print("Perplexity query successful!")
        print("Response:", result)
    except Exception as e:
        print("Perplexity error:", str(e))

async def main():
    await test_search()
    await test_perplexity()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
    print("\nTests completed!")
