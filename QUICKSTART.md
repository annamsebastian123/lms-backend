# HCK LMS — Quick Deployment Guide

Get the LMS demo running in under 5 minutes.

---

## Prerequisites

- Docker & Docker Compose installed
- Ports available: **3000** (frontend), **5000** (backend), **9000/9001** (MinIO)

---

## Step 1: Clone & Deploy

```bash
git clone <your-repo-url> lms-backend
cd lms-backend

# Start all services
docker compose --env-file .env.docker up --build -d
```

Wait ~30 seconds for containers to start, then:

```bash
# Setup database tables
docker exec hck_lms_backend npx prisma db push --force-reset

# Seed demo data
docker exec hck_lms_backend npx prisma db seed
```

---

## Step 2: Access the App

| Service         | URL                     |
|-----------------|-------------------------|
| Frontend        | http://localhost:3000    |
| Backend API     | http://localhost:5000/api |
| MinIO Console   | http://localhost:9001    |

---

## Demo Credentials

All accounts use password: **`demo1234`**

| Role    | Email              | Dashboard             |
|---------|--------------------|-----------------------|
| Admin   | admin@demo.com     | admin-dashboard.html  |
| Tutor   | tutor@demo.com     | tutor-dashboard.html  |
| Learner | learner@demo.com   | dashboard.html        |

---

## What Each Role Can Do

**Admin**
- View platform stats (users, courses, enrollments, certificates)
- Manage users (activate/deactivate, change roles)
- Approve courses for publishing
- View reports & certificates

**Tutor**
- Create courses with modules and lessons (YouTube or self-hosted video)
- Add quizzes to modules
- Submit courses for admin review
- View student enrollment & analytics

**Learner**
- Browse and enroll in published courses
- Watch lessons, track video progress
- Take module quizzes
- Earn certificates on course completion

---

## Common Commands

```bash
# View logs
docker compose logs -f backend

# Restart backend after code changes
docker compose --env-file .env.docker up --build -d backend

# Stop everything
docker compose down

# Stop and wipe all data
docker compose down -v
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Port 5432 conflict | No action needed — Postgres has no host port exposed, it's internal only |
| Backend crash-looping | Run `docker logs hck_lms_backend` to check error |
| "Failed to load courses" on landing page | Backend isn't ready yet — wait 10s and refresh |
| Login says "Invalid credentials" | Re-run seed: `docker exec hck_lms_backend npx prisma db seed` |
| Frontend shows old version | Hard refresh (Ctrl+Shift+R) or rebuild frontend: `docker compose --env-file .env.docker up --build -d frontend` |

---

## Notes

- **Email verification** is disabled for demo — all registered users can login immediately
- **Google OAuth** is disabled — social login buttons are hidden
- **MinIO** is for self-hosted video storage — optional, YouTube links work without it
- To connect to the database externally (e.g., pgAdmin), temporarily add a port mapping in `docker-compose.yml` under the postgres service: `ports: ["5438:5432"]`
