import logfire

# download the data and create the database
with logfire.span("preparing database"):
    with logfire.span("downloading data"):
        print("downloading data")

    with logfire.span("create database"):
        print("create database")
