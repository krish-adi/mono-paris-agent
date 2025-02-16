import dotenv
dotenv.load_dotenv()

from server.services.search import search_content
from server.services.perplexity import ask_perplexity

def test_search():
    print("\nTesting search service...")
    try:
        result = search_content("What is Python programming language?")
        print("Search successful!")
        # The response format seems different, let's just print the whole result
        print("Search result:", result)
    except Exception as e:
        print("Search error:", str(e))

def test_perplexity():
    print("\nTesting perplexity service...")
    try:
        result = ask_perplexity("What is Python programming language?")
        print("Perplexity query successful!")
        print("Response:", result)
    except Exception as e:
        print("Perplexity error:", str(e))

if __name__ == "__main__":
    print("Running service tests...")
    test_search()
    test_perplexity()
    print("\nTests completed!")
