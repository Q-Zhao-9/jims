Docker stack for JIMS (Postgres + FastAPI + nginx + built SPA)

From the repo root:

  docker compose up --build -d db api web

App URL: http://localhost:8080   (set JIMS_WEB_PORT in .env to change host port)

Environment (optional .env next to docker-compose.yml):

  SECRET_KEY=long-random-string
  JIMS_WEB_PORT=8080
  CORS_ORIGINS=http://localhost:8080,http://127.0.0.1:8080

The api service uses DATABASE_URL pointing at the db service (jims/jims). uploads are stored in Docker volume jims_api_uploads.

Postgres only (no app containers): docker compose up -d db   or   db_prod
