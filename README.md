# High Court LMS

A Learning Management System (LMS) developed as part of the High Court Internship project. The system supports role-based access for Administrators, Tutors, and Learners, allowing course creation, approval, enrollment, learning, quizzes, and progress tracking.

---

# Features

## Authentication
- User Registration
- User Login
- JWT Authentication
- Role-Based Authorization (Admin, Tutor, Learner)

## Course Management
- Create Course
- Save as Draft
- Submit for Review
- Admin Approval
- Publish Course
- Delete Course
- Course Categories
- Course Thumbnail Upload
- Role-Based Course Publishing

## Module & Lesson Management
- Create Modules
- Create Lessons
- Update Lessons
- Delete Lessons
- Lesson Ordering

## Video Learning
- YouTube Videos
- Self-Hosted Videos
- Video Progress Tracking
- Resume Playback

## Learner Features
- Enroll in Courses
- Continue Learning
- Quiz Attempt
- Certificates
- Profile Management

## Tutor Features
- Tutor Dashboard
- Tutor Analytics
- My Courses
- Student List

## Admin Features
- User Management
- Course Approval
- Reports
- Certificates
- Dashboard Statistics

---

# Technology Stack

### Backend

- Node.js
- Express.js
- Prisma ORM
- PostgreSQL (Neon)
- JWT Authentication
- Multer
- MinIO Object Storage

### Frontend

- HTML
- CSS
- JavaScript

---

# Prerequisites

Install the following before running the project.

- Node.js (v22.x LTS or later)
- npm
- Git
- Visual Studio Code
- Live Server Extension (VS Code)

---

# Clone Repository

```bash
git clone https://github.com/annamsebastian123/lms-backend.git
cd lms-backend
```

---

# Install Dependencies

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the project root.

Required variables:

```env
DATABASE_URL=

JWT_SECRET=

EMAIL_USER=
EMAIL_PASS=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

SESSION_SECRET=

MINIO_ENDPOINT=
MINIO_PORT=
MINIO_ACCESS_KEY=
MINIO_SECRET_KEY=
MINIO_BUCKET=

CODESPACE_NAME=
```

> **Do not commit your `.env` file to GitHub.**

---

# Database Setup

Generate the Prisma Client.

```bash
npx prisma generate
```

Push the schema to the database.

```bash
npx prisma db push
```

---

# Run Backend

```bash
npm run dev
```

Backend runs at

```
http://localhost:5000
```

---

# Run Frontend

The frontend is inside:

```
frontend/
```

Open the **frontend** folder using **VS Code**.

Start the project using the **Live Server** extension.

Frontend runs at

```
http://localhost:3000
```

---

# Project Setup After Pulling Changes

Whenever you pull the latest changes from GitHub, run:

```bash
git pull origin main
npx prisma generate
npx prisma db push
npm run dev
```

---

# Development Workflow

Check status

```bash
git status
```

Pull latest changes

```bash
git pull origin main
```

Commit changes

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

---

# Project Structure

```
lms-backend
│
├── frontend/
│   ├── js/
│   ├── style.css
│   ├── *.html
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   └── app.js
│
├── package.json
├── README.md
└── .env
```

---

# Role-Based Publishing

Tutors can publish a course for:

- Everyone
- Assistant
- Section Officer
- Assistant Registrar
- Deputy Registrar

Learners only see:

- Courses published for **Everyone**
- Courses published specifically for their designation

---

# Notes

- Backend must be running before starting the frontend.
- The project uses a Neon PostgreSQL database.
- If the Prisma schema changes, always run:

```bash
npx prisma generate
npx prisma db push
```

- Existing JWT tokens become invalid after authentication payload changes. Log out and log back in to generate a new token.
- Never commit the `.env` file or any secrets to GitHub.

---

# Authors

- **Anna M Sebastian**
- Contributors to the High Court LMS Internship Project
