FROM node:22-alpine AS build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Setup venv as required by user rules
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY server/ /app/server/
COPY --from=build /app/client/dist /app/client/dist

# Expose the API port
EXPOSE 8000

# Command to run the FastAPI app
CMD ["uvicorn", "server.main:app", "--host", "0.0.0.0", "--port", "8000"]
