# HCK LMS — Docker Setup Guide

This guide explains how to containerize the full application with three separate services: **PostgreSQL** (database), **Backend** (Express API), and **Frontend** (Nginx static server).

---

## Architecture

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Frontend  │──────▶│   Backend   │──────▶│  PostgreSQL  │
│  (Nginx)    │       │  (Express)  │       │   (pg:15)    │
│  Port 3000  │       │  Port 5000  │       │  Port 5432   │
└─────────────┘       └──────┬──────┘       └─────────────┘
                             │
                      ┌──────▼──────┐
                      │    MinIO    │
                      │ (Optional)  │
                      │  Port 9000  │
                      └─────────────┘
```

All services communicate over a shared Docker network. The frontend Nginx reverse-proxies API calls to the backend container.

---

## File Structure to Create

```
├── docker-compose.yml          # Full multi-service compose file
├── backend.Dockerfile          # Backend image build
├── frontend.Dockerfile         # Frontend image build
├── frontend/
│   └── nginx.conf              # Nginx config for frontend
└── .env.docker                 # Environment variables for Docker
```

---

## Step 1: Backend Dockerfile

Create `backend.Dockerfile` in the project root:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy Prisma schema and generate client
COPY prisma ./prisma
RUN npx prisma generate

# Copy application source
COPY src ./src
COPY uploads ./uploads

# Expose backend port
EXPOSE 5000

# Start the server
CMD ["node", "src/app.js"]
```

---

## Step 2: Frontend Dockerfile

Create `frontend.Dockerfile` in the project root:

```dockerfile
FROM nginx:alpine

# Remove default nginx content
RUN rm -rf /usr/share/nginx/html/*

# Copy frontend files
COPY frontend/ /usr/share/nginx/html/

# Copy custom nginx config
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
```

---

## Step 3: Nginx Configuration

Create `frontend/nginx.conf`:

```nginx
server {
    listen 3000;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Serve static frontend files
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Reverse proxy API requests to backend
    location /api/ {
        proxy_pass http://backend:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Support large file uploads (videos)
        client_max_body_size 500M;
        proxy_read_timeout 300s;
    }

    # Proxy uploaded files (profile images)
    location /uploads/ {
        proxy_pass http://backend:5000/uploads/;
        proxy_set_header Host $host;
    }
}
```

---

## Step 4: Docker Compose (Full Stack)

Replace the existing `docker-compose.yml` with this complete version:

```yaml
services:
  # ─── Database ─────────────────────────────────────────────
  postgres:
    image: postgres:15
    container_name: hck_lms_postgres
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-hck_user}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:-hck_password}
      POSTGRES_DB: ${POSTGRES_DB:-hck_lms}
    ports:
      - "5432:5432"
    volumes:
      - hck_lms_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U hck_user -d hck_lms"]
      interval: 5s
      timeout: 5s
      retries: 5
    networks:
      - lms-network

  # ─── Backend ──────────────────────────────────────────────
  backend:
    build:
      context: .
      dockerfile: backend.Dockerfile
    container_name: hck_lms_backend
    restart: always
    ports:
      - "5000:5000"
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER:-hck_user}:${POSTGRES_PASSWORD:-hck_password}@postgres:5432/${POSTGRES_DB:-hck_lms}
      JWT_SECRET: ${JWT_SECRET:-change-me-in-production}
      GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:-}
      GOOGLE_CLIENT_SECRET: ${GOOGLE_CLIENT_SECRET:-}
      GOOGLE_CALLBACK_URL: ${GOOGLE_CALLBACK_URL:-http://localhost:5000/api/auth/google/callback}
      FRONTEND_URL: ${FRONTEND_URL:-http://localhost:3000}
      EMAIL_USER: ${EMAIL_USER:-}
      EMAIL_PASS: ${EMAIL_PASS:-}
      MINIO_ENDPOINT: ${MINIO_ENDPOINT:-minio}
      MINIO_PORT: ${MINIO_PORT:-9000}
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY:-minioadmin}
      MINIO_BUCKET: ${MINIO_BUCKET:-lms-videos}
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - uploads_data:/app/uploads
    networks:
      - lms-network

  # ─── Frontend ─────────────────────────────────────────────
  frontend:
    build:
      context: .
      dockerfile: frontend.Dockerfile
    container_name: hck_lms_frontend
    restart: always
    ports:
      - "3000:3000"
    depends_on:
      - backend
    networks:
      - lms-network

  # ─── MinIO (Optional: S3-compatible storage) ──────────────
  minio:
    image: minio/minio
    container_name: hck_lms_minio
    restart: always
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-minioadmin}
    command: server /data --console-address ":9001"
    volumes:
      - minio_data:/data
    networks:
      - lms-network

volumes:
  hck_lms_postgres_data:
  uploads_data:
  minio_data:

networks:
  lms-network:
    driver: bridge
```

---

## Step 5: Environment File

Create `.env.docker` in the project root:

```env
# ─── Database ───────────────────────────────────────
POSTGRES_USER=hck_user
POSTGRES_PASSWORD=hck_password
POSTGRES_DB=hck_lms

# ─── Backend ────────────────────────────────────────
JWT_SECRET=your-super-secret-key-change-this
FRONTEND_URL=http://localhost:3000

# ─── Google OAuth (optional) ────────────────────────
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# ─── Email (optional) ──────────────────────────────
EMAIL_USER=
EMAIL_PASS=

# ─── MinIO ──────────────────────────────────────────
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=lms-videos
```

---

## Step 6: Frontend API URL Update

When running in Docker, the frontend should route API calls through Nginx (same origin) instead of directly to `localhost:5000`. Update `frontend/js/api.js` to support this:

```javascript
const API_BASE_URL = window.location.hostname.includes("app.github.dev")
  ? window.location.origin.replace("-3000.", "-5000.") + "/api"
  : window.location.origin + "/api";  // Uses Nginx proxy in Docker
```

> **Note:** If running locally without Docker, you can keep the original `http://localhost:5000/api` fallback. The Nginx proxy handles routing `/api/*` to the backend container.

---

## Usage

### Build and Start Everything

```bash
# Build images and start all services
docker compose --env-file .env.docker up --build -d

# Run database migrations
docker exec hck_lms_backend npx prisma migrate deploy

# (Optional) Seed the database
docker exec hck_lms_backend npx prisma db seed
```

### Access the Application

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000/api |
| MinIO Console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Stop Everything

```bash
docker compose down

# To also remove volumes (deletes all data):
docker compose down -v
```

### Rebuild After Code Changes

```bash
# Rebuild specific service
docker compose --env-file .env.docker up --build -d backend

# Rebuild everything
docker compose --env-file .env.docker up --build -d
```

---

## MinIO Bucket Setup

After first startup, create the required bucket:

```bash
# Using MinIO CLI (mc)
docker exec hck_lms_minio mc alias set local http://localhost:9000 minioadmin minioadmin
docker exec hck_lms_minio mc mb local/lms-videos

# Or use the MinIO Console at http://localhost:9001
# Login: minioadmin / minioadmin
# Create bucket: lms-videos
```

---

## Production Considerations

1. **Change all secrets** — Use strong, unique values for `JWT_SECRET`, `POSTGRES_PASSWORD`, `MINIO_SECRET_KEY`
2. **Use HTTPS** — Add a reverse proxy (Traefik, Caddy) or load balancer with TLS termination
3. **Use `.env` not `.env.docker`** — Docker Compose reads `.env` by default, rename for production
4. **Restrict exposed ports** — In production, only expose port 80/443 from the frontend/proxy. Remove direct access to ports 5000, 5432, 9000
5. **Set resource limits** — Add `deploy.resources.limits` to each service
6. **Use named images** — Tag and push images to a container registry for deployments
7. **Database backups** — Schedule pg_dump or use a managed PostgreSQL service
8. **Health checks** — All services should have proper healthchecks (backend included)

### Backend Health Check (add to docker-compose.yml)

```yaml
backend:
  healthcheck:
    test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:5000/"]
    interval: 10s
    timeout: 5s
    retries: 3
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend can't connect to DB | Check that `postgres` service is healthy before backend starts. The `depends_on` condition handles this. |
| Frontend can't reach API | Verify Nginx config proxies `/api/` to `http://backend:5000/api/`. Check container names match. |
| Prisma migration fails | Run `docker exec hck_lms_backend npx prisma migrate deploy` manually after containers start. |
| File uploads fail | Check `client_max_body_size` in nginx.conf matches your upload limit (500M). |
| MinIO connection refused | Ensure `MINIO_ENDPOINT=minio` (the Docker service name), not `localhost`. |
| Port conflict | Change host ports in docker-compose.yml (e.g., `"3001:3000"` for frontend). |

---

## Docker Ignore

Create `.dockerignore` to keep images lean:

```
node_modules
.git
.env
.env.docker
*.md
uploads/profiles/*
prisma/migrations
```
