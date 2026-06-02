I have a working Node.js + Express + Prisma LMS backend with authentication already completed.

DO NOT REBUILD AUTH. IT IS DONE.

NOW BUILD ONLY THE COURSE MODULE STEP BY STEP.

STEP 1:
Create Prisma Course model:
- id (uuid)
- title
- description
- createdBy (user id)
- createdAt

STEP 2:
Run Prisma migration commands

STEP 3:
Create backend structure:
- courseRoutes.js
- courseController.js
- courseService.js

STEP 4:
Implement APIs:
- POST /api/courses (ADMIN only)
- GET /api/courses (public)
- GET /api/courses/:id (public)
- PUT /api/courses/:id (ADMIN only)
- DELETE /api/courses/:id (ADMIN only)

STEP 5:
Use existing:
- JWT auth middleware
- role middleware (ADMIN/LEARNER)
- Prisma client

RULES:
- Follow same structure as auth module
- Keep code modular and clean
- Do not change auth system