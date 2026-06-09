-- Create enum for course status
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- Add status column to courses, defaulting to DRAFT for new rows
ALTER TABLE "Course"
ADD COLUMN "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT';

-- Preserve existing courses by marking them published
UPDATE "Course"
SET "status" = 'PUBLISHED';
