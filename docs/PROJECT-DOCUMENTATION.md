# HCK LMS — Project Documentation

## Overview

HCK LMS is a full-stack Learning Management System that supports course creation, module/lesson management, video-based learning, quizzes, progress tracking, and certificate issuance. It serves three user roles:

- **Admin** — manages users, approves/publishes courses, views analytics
- **Tutor** — creates courses with modules, lessons, and quizzes
- **Learner** — enrolls in courses, watches lessons, takes quizzes, earns certificates

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Express.js 5.x (Node.js) |
| Database | PostgreSQL 15 |
| ORM | Prisma 5.22 |
| Auth | JWT + Passport.js (Google OAuth 2.0) |
| File Upload | Multer (memory) + MinIO (S3-compatible) |
| Email | Nodemailer (Gmail SMTP) |
| PDF | PDFKit |
| Frontend | Static HTML + Vanilla JavaScript |
| Dev Tools | Nodemon, Docker Compose |

---

## Project Structure

```
├── frontend/               # Static HTML + JS frontend
│   ├── *.html              # Page templates
│   ├── js/                 # Per-page JavaScript files
│   │   ├── api.js          # Centralized API client
│   │   ├── dashboard.js    # Learner dashboard logic
│   │   ├── admin-*.js      # Admin page logic
│   │   ├── tutor-*.js      # Tutor page logic
│   │   └── ...
│   ├── app.js              # Shared app logic (login, course rendering)
│   └── style.css           # Global styles
├── src/                    # Backend source
│   ├── app.js              # Express app entry point (port 5000)
│   ├── config/
│   │   └── passport.js     # Google OAuth strategy
│   ├── controllers/        # Route handlers (9 controllers)
│   ├── middlewares/
│   │   ├── authMiddleware.js    # JWT verification
│   │   ├── roleMiddleware.js    # Role-based access
│   │   └── uploadMiddleware.js  # Multer config (500MB limit)
│   ├── routes/             # Express routers (9 route files)
│   ├── services/           # Business logic layer (6 services)
│   ├── utils/
│   │   └── jwt.js          # Token generation (1-day expiry)
│   └── prisma.js           # Prisma client singleton
├── prisma/
│   ├── schema.prisma       # Database schema
│   ├── migrations/         # SQL migration history
│   └── seed.js             # Database seeder
├── uploads/                # Local file storage (profile images)
├── docker-compose.yml      # PostgreSQL container
└── package.json
```

---

## Backend Architecture

### Request Flow

```
Client → Route → Middleware (auth/role) → Controller → Service → Prisma → PostgreSQL
```

### API Routes

All routes are prefixed with `/api`:

| Prefix | File | Purpose |
|--------|------|---------|
| `/api/auth` | authRoutes.js | Register, login, password reset, email verification, Google OAuth |
| `/api/users` | userRoutes.js | User CRUD (admin) |
| `/api/courses` | courseRoutes.js | Course/module/lesson CRUD, enrollment, analytics |
| `/api/profile` | profileRoutes.js | Learner profile management |
| `/api/tutor-profile` | tutorProfileRoutes.js | Tutor profile management |
| `/api/upload` | uploadRoutes.js | Video + profile image uploads |
| `/api/certificates` | certificateRoutes.js | Certificate generation/download |
| `/api/progress` | progressRoutes.js | Video/lesson progress tracking |
| `/api/quiz` | quizRoutes.js | Quiz creation, attempts, scoring |

### Key Endpoints

**Authentication:**
- `POST /api/auth/register` — Create account (sends email OTP)
- `POST /api/auth/login` — Get JWT token
- `POST /api/auth/verify-email` — Verify email with OTP
- `POST /api/auth/forgot-password` — Request password reset OTP
- `POST /api/auth/reset-password` — Reset password with OTP
- `GET /api/auth/google` — Initiate Google OAuth
- `GET /api/auth/google/callback` — Google OAuth callback

**Courses:**
- `POST /api/courses` — Create course (tutor)
- `GET /api/courses` — List all published courses
- `GET /api/courses/:id` — Get course details
- `POST /api/courses/:id/enroll` — Enroll in course (learner)
- `POST /api/courses/:id/modules` — Add module to course
- `POST /api/courses/modules/:id/lessons` — Add lesson to module
- `POST /api/courses/:id/publish` — Publish course (admin only)

---

## Authentication

### JWT Token Flow
1. User logs in → receives JWT (1-day expiry)
2. Token stored in `localStorage` on the frontend
3. Sent as `Authorization: Bearer <token>` on every protected request
4. `authMiddleware` decodes token and attaches user to `req.user`

### Registration Flow
1. Validate inputs (name ≥ 3 chars, valid email, password ≥ 6 chars)
2. Hash password with bcryptjs (10 rounds)
3. Generate 6-digit OTP, store with 10-minute expiry
4. Send OTP to user's email via Gmail SMTP
5. User calls `/verify-email` with OTP to activate account

### Google OAuth
- Passport.js strategy with Google OAuth 2.0
- Auto-creates user on first Google login (role: LEARNER)
- Redirects to frontend with token in query parameter

---

## Database Schema

### Core Models

```
User ──< Enrollment >── Course ──< Module ──< Lesson
  │                        │          │          │
  │                        │          └──< Question ──< QuestionOption
  │                        │          │
  └──< VideoProgress ─────────────────┘
  │                        │
  └──< QuizAttempt ────────┘──< AttemptAnswer
  │                        │
  └──< Certificate ────────┘
```

### Enums
- **Role**: `ADMIN`, `TUTOR`, `LEARNER`
- **CourseStatus**: `DRAFT`, `PUBLISHED`, `PENDING_REVIEW`, `ARCHIVED`
- **VideoSource**: `YOUTUBE`, `SELF_HOSTED`

---

## File Storage

| Type | Storage | Location |
|------|---------|----------|
| Profile images | Local filesystem | `uploads/profiles/` |
| Lesson videos | MinIO (S3-compatible) | `videos/{timestamp}-{filename}` |

- Profile images served via Express static middleware at `/uploads`
- Max upload size: 500 MB
- Accepted image types: jpeg, png, jpg, webp

---

## Frontend Architecture

The frontend is a set of static HTML pages, each with a corresponding JS file for page-specific logic.

### API Client (`frontend/js/api.js`)

A global `apiRequest(endpoint, options)` function that:
- Prepends the API base URL
- Attaches JWT from localStorage
- Serializes JSON bodies
- Handles error responses

### Base URL Detection
```javascript
// Auto-detects GitHub Codespaces vs local development
const API_BASE_URL = window.location.hostname.includes("app.github.dev")
  ? window.location.origin.replace("-3000.", "-5000.") + "/api"
  : "http://localhost:5000/api";
```

### Client-Side Data
- `localStorage.token` — JWT auth token
- `localStorage.user` — Serialized user object (name, role, id)
- `localStorage.selectedCourseId` — Current course context

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://hck_user:hck_password@localhost:5432/hck_lms

# Authentication
JWT_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:3000

# Email (Gmail SMTP)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password

# MinIO / S3 Storage
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=your-access-key
MINIO_SECRET_KEY=your-secret-key
MINIO_BUCKET=lms-videos
```

---

## Running Locally (Current Setup)

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Install dependencies
npm install

# 3. Run migrations
npx prisma migrate deploy

# 4. (Optional) Seed data
npx prisma db seed

# 5. Start backend (port 5000)
npm run dev

# 6. Serve frontend (port 3000) — use any static server
npx serve frontend -l 3000
```

---

## Key Design Decisions

- **No frontend build step** — plain HTML/JS for simplicity
- **Prisma ORM** — type-safe DB access with migration support
- **MinIO** — self-hosted S3-compatible storage for videos (avoids cloud vendor lock-in)
- **OTP-based email verification** — no magic links, simpler to implement
- **JWT stored in localStorage** — simple but not httpOnly (trade-off for vanilla JS frontend)
- **Role middleware** — composable access control per route
