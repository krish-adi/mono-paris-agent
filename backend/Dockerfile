FROM ghcr.io/astral-sh/uv:python3.12-alpine


# Set working directory
WORKDIR /app

# Copy requirements file (if you have one)
COPY . .

# Command to run the application
CMD ["uv", "run", "main.py"]
