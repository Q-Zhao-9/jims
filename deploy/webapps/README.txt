JIMS deployment folder (no IIS)

Layout after deploy-webapps.ps1:
  www\       Static files from npm run build (index.html, assets\)
  backend\   FastAPI application
  run-api.ps1  Starts the API on http://127.0.0.1:8001

1) In backend:  python -m pip install -r requirements.txt
2) Configure backend\.env (copy from .env.example if needed): DATABASE_URL, SECRET_KEY, CORS_ORIGINS.
3) Start the API:  .\run-api.ps1

The SPA uses relative URLs under /api. To use this copy with a browser without IIS:
- Easiest: from the git repo run  .\scripts\prod-stack.ps1  (builds, starts API on 8001 + vite preview on 4173 with proxy), or
- Run run-api.ps1 here, then from the repo use  npm run dev  /  npm run preview  with VITE_PREVIEW_API_PROXY=http://127.0.0.1:8001 and CORS_ORIGINS including your preview origin, or
- nginx: example config is deploy\nginx\jims.conf (proxy /api/ to 127.0.0.1:8001; optional SPA root).
