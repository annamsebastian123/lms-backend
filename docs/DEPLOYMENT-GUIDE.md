# HCK LMS — Deployment Guide

A practical guide for deploying the HCK LMS application to a production server. Covers single-server deployment (VPS), cloud platform options, and CI/CD setup.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Option 1: Single Server (VPS) Deployment](#option-1-single-server-vps-deployment)
- [Option 2: Cloud Platform Deployment](#option-2-cloud-platform-deployment)
- [Domain & SSL Setup](#domain--ssl-setup)
- [CI/CD Pipeline](#cicd-pipeline)
- [Environment Configuration](#environment-configuration)
- [Database Management](#database-management)
- [Monitoring & Logging](#monitoring--logging)
- [Scaling](#scaling)
- [Security Checklist](#security-checklist)
- [Rollback Strategy](#rollback-strategy)

---

## Prerequisites

Before deploying, ensure you have:

- A domain name (e.g., `lms.yourdomain.com`)
- A server or cloud account (AWS, DigitalOcean, Railway, Render, etc.)
- Docker and Docker Compose installed on the target server
- Git access to the repository
- Gmail app password for email (or a transactional email provider)
- Google OAuth credentials configured for your production domain

---

## Option 1: Single Server (VPS) Deployment

Best for: small to medium teams, cost-effective, full control.

Suitable providers: DigitalOcean Droplets, AWS EC2, Linode, Hetzner, Vultr.

### 1.1 Server Setup

```bash
# SSH into your server
ssh root@your-server-ip

# Update system packages
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Install Docker Compose (if not bundled)
apt install docker-compose-plugin -y

# Add your deploy user
adduser deploy
usermod -aG docker deploy

# Switch to deploy user
su - deploy
```

### 1.2 Clone and Configure

```bash
# Clone the repository
git clone https://github.com/your-org/hck-lms.git
cd hck-lms

# Create production environment file
cp .env.docker .env.production
nano .env.production
```

Fill in production values (see [Environment Configuration](#environment-configuration) below).

### 1.3 Deploy with Docker Compose

```bash
# Build and start all services
docker compose --env-file .env.production up --build -d

# Run database migrations
docker exec hck_lms_backend npx prisma migrate deploy

# (First time only) Seed initial admin user
docker exec hck_lms_backend npx prisma db seed

# Create MinIO bucket
docker exec hck_lms_minio mc alias set local http://localhost:9000 $MINIO_ACCESS_KEY $MINIO_SECRET_KEY
docker exec hck_lms_minio mc mb local/lms-videos --ignore-existing
```

### 1.4 Add Reverse Proxy with SSL (Caddy)

Install Caddy as a host-level reverse proxy for automatic HTTPS:

```bash
# Install Caddy
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update && apt install caddy -y
```

Create `/etc/caddy/Caddyfile`:

```
lms.yourdomain.com {
    reverse_proxy localhost:3000
}

api.yourdomain.com {
    reverse_proxy localhost:5000
}
```

```bash
# Start Caddy (auto-obtains SSL certificates)
systemctl enable caddy
systemctl restart caddy
```

> **Alternative:** If you prefer a single domain, use the Nginx proxy inside Docker (as described in DOCKER-SETUP.md) and point Caddy to port 3000 only. The Nginx container already proxies `/api/` to the backend.

### 1.5 Firewall Configuration

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (for SSL redirect)
ufw allow 443/tcp   # HTTPS
ufw deny 5000       # Block direct backend access
ufw deny 5432       # Block direct DB access
ufw deny 9000       # Block direct MinIO access
ufw enable
```

---

## Option 2: Cloud Platform Deployment

### Railway / Render (Simplest)

Both platforms support Docker-based deployments with managed PostgreSQL.

**Railway:**
1. Connect your GitHub repo
2. Add a PostgreSQL plugin (provides `DATABASE_URL` automatically)
3. Set environment variables in the dashboard
4. Railway detects the Dockerfile and deploys
5. Frontend can be deployed as a separate static service or combined

**Render:**
1. Create a "Web Service" from your repo, point to `backend.Dockerfile`
2. Create a "Static Site" for the frontend folder
3. Add a managed PostgreSQL instance
4. Set environment variables in the dashboard

### AWS (ECS + RDS)

For larger scale:

1. **Database**: Use RDS PostgreSQL (managed, with backups)
2. **Backend**: Deploy to ECS Fargate using `backend.Dockerfile`
3. **Frontend**: Upload to S3 + CloudFront (static hosting with CDN)
4. **Storage**: Replace MinIO with actual S3
5. **Secrets**: Use AWS Secrets Manager for env vars

### DigitalOcean App Platform

1. Create an App from your GitHub repo
2. Add a managed PostgreSQL database
3. Configure two components:
   - Backend: Docker-based, uses `backend.Dockerfile`
   - Frontend: Static site from `frontend/` folder
4. Set environment variables per component

---

## Domain & SSL Setup

### DNS Configuration

Point your domain to the server:

```
Type    Name              Value
A       lms              your-server-ip
A       api.lms          your-server-ip
```

Or for a single domain (using Nginx proxy approach):

```
Type    Name              Value
A       lms              your-server-ip
```

### SSL Certificates

**With Caddy** (recommended): Automatic. Caddy obtains and renews Let's Encrypt certificates.

**With Certbot (Nginx)**:
```bash
apt install certbot python3-certbot-nginx -y
certbot --nginx -d lms.yourdomain.com
```

### Update OAuth Redirect URIs

After setting up your domain, update Google OAuth settings:
1. Go to Google Cloud Console → APIs & Credentials
2. Update authorized redirect URI to: `https://api.lms.yourdomain.com/api/auth/google/callback`
3. Update `GOOGLE_CALLBACK_URL` in your `.env.production`

---

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy to server
        uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /home/deploy/hck-lms
            git pull origin main
            docker compose --env-file .env.production up --build -d
            docker exec hck_lms_backend npx prisma migrate deploy
            echo "Deployment complete"
```

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `SERVER_HOST` | Your server IP address |
| `SERVER_USER` | SSH username (e.g., `deploy`) |
| `SSH_PRIVATE_KEY` | Private key for SSH access |

### Manual Deployment

If you prefer manual deploys:

```bash
ssh deploy@your-server-ip
cd hck-lms
git pull origin main
docker compose --env-file .env.production up --build -d
docker exec hck_lms_backend npx prisma migrate deploy
```

---

## Environment Configuration

### Production `.env.production`

```env
# ─── Database ───────────────────────────────────────
POSTGRES_USER=hck_user
POSTGRES_PASSWORD=<strong-random-password>
POSTGRES_DB=hck_lms

# ─── Backend ────────────────────────────────────────
JWT_SECRET=<64-char-random-string>
FRONTEND_URL=https://lms.yourdomain.com
NODE_ENV=production

# ─── Google OAuth ───────────────────────────────────
GOOGLE_CLIENT_ID=your-production-client-id
GOOGLE_CLIENT_SECRET=your-production-client-secret
GOOGLE_CALLBACK_URL=https://api.lms.yourdomain.com/api/auth/google/callback

# ─── Email ──────────────────────────────────────────
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASS=your-app-password

# ─── MinIO ──────────────────────────────────────────
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_ACCESS_KEY=<strong-access-key>
MINIO_SECRET_KEY=<strong-secret-key>
MINIO_BUCKET=lms-videos
```

### Generate Strong Secrets

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate database password
openssl rand -base64 24

# Generate MinIO keys
openssl rand -hex 16  # access key
openssl rand -hex 32  # secret key
```

---

## Database Management

### Migrations

```bash
# Apply pending migrations (safe, non-destructive)
docker exec hck_lms_backend npx prisma migrate deploy

# Check migration status
docker exec hck_lms_backend npx prisma migrate status
```

### Backups

Set up automated daily backups:

```bash
# Create backup script at /home/deploy/backup-db.sh
#!/bin/bash
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/home/deploy/backups
mkdir -p $BACKUP_DIR

docker exec hck_lms_postgres pg_dump -U hck_user hck_lms | gzip > $BACKUP_DIR/lms_$TIMESTAMP.sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +7 -delete
```

```bash
# Make executable and add to cron
chmod +x /home/deploy/backup-db.sh
crontab -e
# Add: 0 3 * * * /home/deploy/backup-db.sh
```

### Restore from Backup

```bash
gunzip -c backups/lms_20260626_030000.sql.gz | docker exec -i hck_lms_postgres psql -U hck_user hck_lms
```

---

## Monitoring & Logging

### Basic Monitoring

```bash
# Check service health
docker compose ps

# View real-time logs
docker compose logs -f --tail=100

# Check resource usage
docker stats
```

### Log Rotation

Add to docker-compose services to prevent unbounded log growth:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Uptime Monitoring

Use a free uptime monitor (UptimeRobot, Betterstack, Healthchecks.io) to ping:
- `https://lms.yourdomain.com` — frontend alive
- `https://api.lms.yourdomain.com/` — backend alive (returns "LMS Backend Running")

### Application-Level Monitoring (Optional)

For production insights, consider adding:
- **PM2** inside the backend container for process management and metrics
- **Sentry** for error tracking (add `@sentry/node` to backend)
- **Prometheus + Grafana** for metrics dashboards

---

## Scaling

### Vertical Scaling (Quick)

Resize your VPS to add more CPU/RAM. Restart containers after resize:

```bash
docker compose --env-file .env.production up -d
```

### Horizontal Scaling

When you outgrow a single server:

1. **Database**: Move to a managed PostgreSQL service (RDS, DigitalOcean Managed DB, Supabase)
2. **Backend**: Run multiple backend containers behind a load balancer
3. **Frontend**: Serve from a CDN (CloudFront, Cloudflare Pages)
4. **Storage**: Replace MinIO with AWS S3 or Cloudflare R2
5. **Sessions**: If session-based features are added, use Redis for shared session storage

### Load Balancer Configuration

If running multiple backend instances, update docker-compose:

```yaml
services:
  backend:
    deploy:
      replicas: 3
    # Remove fixed container_name when using replicas
```

---

## Security Checklist

Before going live, verify:

- [ ] All default passwords changed (DB, MinIO, JWT secret)
- [ ] `.env.production` is NOT committed to git (add to `.gitignore`)
- [ ] Firewall blocks direct access to DB (5432), MinIO (9000), and backend (5000)
- [ ] Only ports 80 and 443 are publicly accessible
- [ ] SSL/TLS configured (all traffic over HTTPS)
- [ ] Google OAuth redirect URIs updated for production domain
- [ ] CORS origin in `src/app.js` updated to production frontend URL
- [ ] `console.log` statements with sensitive data removed (DB URL, JWT, etc.)
- [ ] Rate limiting added to auth endpoints (consider `express-rate-limit`)
- [ ] File upload validation enforced (type, size)
- [ ] Database backups automated and tested
- [ ] SSH key-based authentication enabled (password login disabled)
- [ ] Docker images use specific tags (not `latest`) for reproducibility

### CORS Update for Production

Update `src/app.js` before deploying:

```javascript
app.use(cors({
  origin: [
    process.env.FRONTEND_URL,  // Use env var instead of hardcoded URLs
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
```

---

## Rollback Strategy

### Quick Rollback (Git-based)

```bash
# On the server
cd /home/deploy/hck-lms

# Go back to previous commit
git log --oneline -5   # Find the commit to rollback to
git checkout <commit-hash>

# Rebuild and restart
docker compose --env-file .env.production up --build -d
```

### Database Rollback

If a migration caused issues:

```bash
# Restore from the latest backup
gunzip -c backups/lms_latest.sql.gz | docker exec -i hck_lms_postgres psql -U hck_user hck_lms

# Then rollback the code to match
git checkout <previous-commit>
docker compose --env-file .env.production up --build -d
```

### Blue-Green Deployment (Advanced)

For zero-downtime deployments:

1. Run new version on a different port
2. Test it's working
3. Switch the reverse proxy to point to the new version
4. Stop the old version

```bash
# Start new version on alternate ports
docker compose -f docker-compose.blue.yml --env-file .env.production up --build -d

# Verify new version works
curl http://localhost:5001/

# Update Caddy/Nginx to point to new ports
# Then stop old version
docker compose down
```

---

## Post-Deployment Verification

After each deployment, verify:

```bash
# 1. All containers running
docker compose ps

# 2. Backend responding
curl -s https://api.lms.yourdomain.com/ | grep "LMS Backend Running"

# 3. Frontend loads
curl -s -o /dev/null -w "%{http_code}" https://lms.yourdomain.com/

# 4. Database accessible from backend
docker exec hck_lms_backend npx prisma migrate status

# 5. Check logs for errors
docker compose logs --tail=50 backend | grep -i error
```

---

## Summary

| Step | Action |
|------|--------|
| 1 | Provision server and install Docker |
| 2 | Clone repo and configure `.env.production` |
| 3 | Run `docker compose up --build -d` |
| 4 | Apply migrations with `prisma migrate deploy` |
| 5 | Set up reverse proxy (Caddy) for SSL |
| 6 | Configure firewall (only 80/443 open) |
| 7 | Set up DNS and update OAuth settings |
| 8 | Configure backups and monitoring |
| 9 | Verify everything works end to end |
