
# Software Requirements Specification (SRS)
## Job Interview Management System (JIMS)

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the **Job Interview Management System (JIMS)**. The system is a multi-user web-based platform designed to help job applicants manage job applications, resumes, interviews, reminders, analytics, and AI-assisted preparation workflows.

### 1.2 Intended Audience
This document is intended for:
- Developers
- Project supervisors
- Portfolio reviewers
- Future collaborators

### 1.3 Scope
JIMS enables users to:
- Track job applications
- Manage multiple resume versions
- Log interview schedules
- Record feedback and preparation notes
- Receive LLM-based intelligent assistance
- Analyze application success patterns

---

## 2. Overall Description

### 2.1 Product Perspective
JIMS is a standalone web-based multi-user system deployed locally in Version 1 (V1). It integrates structured tracking tools with LLM-powered assistants to enhance applicant productivity.

### 2.2 User Classes

Primary users:
- Individual job applicants

Administrative users:
- Not included in Version 1 (future extension planned)

### 2.3 Operating Environment

Frontend:
- Modern web browser (Chrome, Edge, Firefox)

Backend:
- FastAPI application server

Database:
- PostgreSQL (recommended)

Deployment:
- Localhost environment (Version 1); see **Section 10. Local Deployment** for Docker PostgreSQL (dev/prod), environment variables, and `deploy.cmd` / `deploy.ps1`.

Authentication:
- Email + password authentication

---

## 3. System Features (Functional Requirements)

### 3.1 User Authentication Module

The system shall:

- FR-1 Allow user registration using email and password
- FR-2 Allow secure login/logout
- FR-3 Store encrypted credentials
- FR-4 Support session-based authentication

---

### 3.2 Application Tracking Module

The system shall:

- FR-5 Allow users to create job application records
- FR-6 Allow editing application metadata
- FR-7 Allow deleting application records
- FR-8 Support status values:

```
Saved
Applied
OA
Interview
Final Round
Offer
Rejected
Ghosted
```

- FR-9 Record application submission date
- FR-10 Record deadlines
- FR-11 Record next-action reminders
- FR-12 Attach notes to applications

---

### 3.3 Resume Management Module

The system shall:

- FR-13 Allow uploading multiple resume versions
- FR-14 Store resume files locally (Version 1)
- FR-15 Link resumes to job applications
- FR-16 Maintain resume usage history

---

### 3.4 Interview Logging Module

The system shall:

- FR-17 Record interview events
- FR-18 Store interview type
- FR-19 Store meeting links
- FR-20 Record interviewer information
- FR-21 Store interview notes

---

### 3.5 Reminder System

The system shall:

- FR-22 Provide in-app reminders
- FR-23 Provide email reminders
- FR-24 Provide calendar reminders (future integration ready)

---

### 3.6 Notes and Feedback Module

The system shall:

- FR-25 Allow structured interview feedback logging
- FR-26 Allow recruiter interaction tracking
- FR-27 Allow improvement-point tracking

---

## 4. AI-Enhanced Functional Modules 🤖

### 4.1 Job Description Analyzer

The system shall:

- FR-28 Extract required skills from job descriptions
- FR-29 Identify missing skills relative to user resume
- FR-30 Highlight critical keywords

---

### 4.2 Resume–Job Matching Engine

The system shall:

- FR-31 Compute similarity scores using hybrid embedding + LLM scoring
- FR-32 Provide interpretable match-score outputs
- FR-33 Support explainability extensions

---

### 4.3 Interview Preparation Assistant

The system shall:

- FR-34 Suggest interview preparation topics
- FR-35 Highlight knowledge gaps
- FR-36 Provide company-specific preparation hints

---

### 4.4 Smart Reminder Assistant

The system shall:

- FR-37 Generate intelligent follow-up reminders
- FR-38 Detect approaching deadlines
- FR-39 Suggest preparation timing strategies

---

## 5. Analytics and Visualization Module 📊

The system shall:

- FR-40 Display total application counts
- FR-41 Display interview conversion rate
- FR-42 Display offer conversion rate
- FR-43 Display response latency metrics
- FR-44 Provide resume performance comparison analytics
- FR-45 Provide company-category success-rate visualization
- FR-46 Provide skill-gap analytics derived from job descriptions

---

## 6. External Interface Requirements

### 6.1 User Interface

The system shall:

- Support responsive layout
- Provide dashboard visualization
- Provide table-based application tracking
- Support intuitive navigation

### 6.2 Hardware Interface

No specialized hardware required.

### 6.3 Software Interface

External dependencies:

- LLM API integration
- Email notification services
- Optional calendar APIs (future-ready)

### 6.4 Communications Interface

HTTPS-ready architecture for future deployment

---

## 7. Non-Functional Requirements ⚙️

### 7.1 Performance Requirements

The system shall:

- NFR-1 Support hundreds of applications per user
- NFR-2 Provide responsive dashboard rendering

### 7.2 Security Requirements

The system shall:

- NFR-3 Encrypt stored credentials
- NFR-4 Protect user-specific records
- NFR-5 Prevent unauthorized access

### 7.3 Usability Requirements

The system shall:

- NFR-6 Support mobile-first usability
- NFR-7 Provide intuitive workflow navigation

### 7.4 Scalability Requirements

The system shall:

- NFR-8 Support transition to cloud deployment
- NFR-9 Support multi-user scaling architecture

---

## 8. Data Requirements

Entities include:

- Users
- Applications
- Resumes
- Interviews
- Notes
- Reminders
- Analytics metadata

Relationships:

- One user → multiple applications
- One application → one resume reference
- One application → multiple interview records

---

## 9. Assumptions and Constraints

### Assumptions

- Users operate via modern browsers
- LLM APIs remain accessible

### Constraints

- Version 1 deployed locally
- Resume files stored locally
- Calendar integration deferred to future release

---

## 10. Local Deployment

This section describes how to run JIMS on a developer machine with PostgreSQL in Docker, including separate dev and prod database containers and the one-step deployment script.

### 10.1 Prerequisites

- Docker Desktop (or Docker Engine with Compose) for PostgreSQL
- Python 3 with `pip` (backend)
- Node.js and npm (frontend build and preview)

### 10.2 PostgreSQL in Docker (dev vs prod)

The repository root `docker-compose.yml` defines two services:

| Service | Container name | Host port | Volume | Purpose |
|--------|----------------|-----------|--------|---------|
| `db` | `jims-postgres-dev` | 5432 | `jims_pgdata` | Development |
| `db_prod` | `jims-postgres-prod` | 5433 | `jims_pgdata_prod` | Local production / deployment testing |

- **Development:** `docker compose up -d db` — connect with `postgresql://jims:jims@localhost:5432/jims`.
- **Production (local):** `docker compose up -d db_prod` — connect with `postgresql://jims:jims_prod@localhost:5433/jims`.

The two instances use isolated ports and volumes so dev data is not mixed with prod-style data on the same machine.

### 10.3 Backend configuration

Copy `backend/.env.example` to `backend/.env` and set at least:

- `DATABASE_URL` — use the URL for the database you intend to run (dev or prod port as above).
- `SECRET_KEY` — a long random string (required for sessions).
- `CORS_ORIGINS` — include the Vite dev server (`http://localhost:5173`, etc.) and, if using a production build with `vite preview`, port **4173** (see `.env.example`).

The FastAPI app reads these from `backend/.env` when started from the `backend` directory.

### 10.4 Manual run (development)

1. Start the desired Postgres service (`db` or `db_prod`).
2. From `backend/`: install dependencies (`pip install -r requirements.txt`), then run `python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000`.
3. From the repository root: `npm install` then `npm run dev` for the Vite dev server (proxies `/api` to port 8000).

**Quick recovery** (nothing listening on 5173/8000): run **`.\scripts\start-dev.ps1`** — opens two windows for the API and Vite, then open **http://localhost:5173**. After **`.\scripts\prod-stack-stop.ps1`**, use **`.\scripts\prod-stack.ps1`** to bring prod (4173/8001) back, or **`start-dev.ps1`** for dev.

### 10.5 One-step local production deployment

The repository provides:

- **`deploy.ps1`** — PowerShell script at the repository root.
- **`deploy.cmd`** — Wrapper to run `deploy.ps1` (double-click or `deploy.cmd` from a command prompt).

**What the script does (default):**

1. Starts `db_prod` (`docker compose up -d db_prod`).
2. Waits until PostgreSQL accepts connections.
3. Installs backend Python dependencies from `backend/requirements.txt`.
4. Runs `npm ci` and `npm run build` for the frontend.
5. Opens two new windows: **FastAPI** on `http://127.0.0.1:8000` with `DATABASE_URL` set to the prod Docker URL, and **`npm run preview`** for the static build (default `http://127.0.0.1:4173`, with Vite preview proxying `/api` to the API).

**Prepare only (no new windows):** `.\deploy.ps1 -PrepareOnly` or `deploy.cmd -PrepareOnly`.

**Notes:** The API process started by the script sets `DATABASE_URL` for the prod container so it does not accidentally use a dev URL from `.env`. Keep `SECRET_KEY` and `CORS_ORIGINS` correct in `backend/.env`. If `npm ci` fails with file-lock errors on Windows, close processes using `node_modules` (e.g. dev servers) and retry. If port **8000** is already in use (e.g. dev API), the script starts the prod API on **8001** and sets **`VITE_PREVIEW_API_PROXY`** so `vite preview` proxies to that port. The Vite **`preview`** proxy defaults to **8001** in `vite.config.ts` so `npm run preview` matches the local prod API without extra env (override with **`VITE_PREVIEW_API_PROXY`** if the API runs on another port).

### 10.6 Prod stack as a Windows autostart service (non-interfering)

Development stays on **uvicorn port 8000** and **Vite dev port 5173**. The automated prod stack uses **API port 8001**, **Vite preview port 4173**, and **Postgres `db_prod` on host port 5433** — no overlap with default dev ports.

| Role | Dev | Prod (this stack) |
|------|-----|-------------------|
| FastAPI | 8000 | 8001 |
| Frontend | 5173 (`npm run dev`) | 4173 (`npm run preview` + `dist/`) |
| Postgres | `db` → 5432 | `db_prod` → 5433 |

Scripts under **`scripts/`**:

- **`prod-stack.ps1`** — Starts `db_prod`, runs **`pip install -r backend/requirements.txt`** for the same Python used to start uvicorn (avoids `No module named uvicorn` when `python` points at a bare install), then starts the prod API and Vite preview **without** extra console windows (hidden processes). Requires `dist/` (run `npm run build` at least once). Logs to **`logs/prod-stack.log`**. Optional delay: `-StartupDelaySeconds` (default **30**) so Docker Desktop can start after logon.
- **`prod-stack-stop.ps1`** — Stops whatever is listening on **8001** and **4173** (prod only). Does not stop dev servers or Docker `db_prod`.
- **`install-prod-autostart.ps1`** — Registers a **Scheduled Task** (`JIMS-ProdStack`) that runs `prod-stack.ps1` **at user logon** (default delay **35** seconds before the script runs, configurable). Run once in PowerShell; use **Administrator** if registration is denied.
- **`uninstall-prod-autostart.ps1`** — Removes that scheduled task.

**Install:** `.\scripts\install-prod-autostart.ps1` — then build the frontend once: `npm run build`. **Test the task:** `Start-ScheduledTask -TaskName JIMS-ProdStack`. **Remove autostart:** `.\scripts\uninstall-prod-autostart.ps1`.

### 10.7 Deploy folder `C:\webapps\jims` (no IIS)

To copy the built SPA and backend to **`C:\webapps\jims`** (or another path) **without IIS**:

- Run **`.\scripts\deploy-webapps.ps1`** (default **`C:\webapps\jims`**). Override with **`-TargetRoot 'D:\path'`**.
- Produces **`www\`** (static build), **`backend\`**, **`run-api.ps1`**, and **`README.txt`**. This is a file layout only; use **`run-api.ps1`** for the API, or **`scripts\prod-stack.ps1`** from the repo for integrated local preview. See **`deploy\webapps\README.txt`**.
- For **nginx** as reverse proxy for **`/api/`** → FastAPI on **`127.0.0.1:8001`**, see **`deploy\nginx\jims.conf`**.

---

## 11. Future Enhancements 🚀

Planned upgrades include:

- Cloud deployment architecture
- Resume A/B testing analytics
- Job recommendation engine
- Multi-provider authentication
- External calendar synchronization
