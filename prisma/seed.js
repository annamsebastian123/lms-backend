const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Seed default categories
  const defaultCategories = [
    "Legal Procedures",
    "Registry Operations",
    "Court Technology",
    "Administration",
    "General"
  ];

  for (const name of defaultCategories) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }

  const password = await bcrypt.hash("demo1234", 10);

  // Admin user
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      name: "Demo Admin",
      passwordHash: password,
      role: "ADMIN",
      isEmailVerified: true,
      isActive: true,
      phone: "9876543210",
      section: "Administration",
      designation: "DEPUTY_REGISTRAR",
    },
  });

  // Tutor user
  const tutor = await prisma.user.upsert({
    where: { email: "tutor@demo.com" },
    update: {},
    create: {
      email: "tutor@demo.com",
      name: "Demo Tutor",
      passwordHash: password,
      role: "TUTOR",
      isEmailVerified: true,
      isActive: true,
      phone: "9876543211",
      section: "Training",
      designation: "SECTION_OFFICER",
    },
  });

  // Learner user
  const learner = await prisma.user.upsert({
    where: { email: "learner@demo.com" },
    update: {},
    create: {
      email: "learner@demo.com",
      name: "Demo Learner",
      passwordHash: password,
      role: "LEARNER",
      isEmailVerified: true,
      isActive: true,
      phone: "9876543212",
      section: "Registry",
      designation: "ASSISTANT",
    },
  });

  // Sample courses by tutor
  const course1 = await prisma.course.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: "Introduction to Court Registry Procedures",
      description:
        "Learn the fundamentals of court registry operations, filing systems, case management, and administrative processes essential for registry staff.",
      userId: tutor.id,
      status: "PUBLISHED",
      category: "Legal",
      targetRole: "ASSISTANT",
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 2 },
    update: {},
    create: {
      title: "Digital Filing & Document Management",
      description:
        "Master the digital tools and systems used for electronic filing, document indexing, case tracking, and records management in the modern court environment.",
      userId: tutor.id,
      status: "PUBLISHED",
      category: "Technology",
      targetRole: "SECTION_OFFICER",
    },
  });

  const course3 = await prisma.course.upsert({
    where: { id: 3 },
    update: {},
    create: {
      title: "Legal Research & Case Law Analysis",
      description:
        "Develop skills in legal research methodology, case law databases, citation standards, and analytical writing for court professionals.",
      userId: tutor.id,
      status: "PUBLISHED",
      category: "Legal",
      targetRole: "ALL",
    },
  });

  // Modules for course 1
  const mod1 = await prisma.module.create({
    data: {
      title: "Registry Organization & Structure",
      courseId: course1.id,
    },
  });

  const mod2 = await prisma.module.create({
    data: {
      title: "Case Filing Procedures",
      courseId: course1.id,
    },
  });

  // Lessons for module 1
  await prisma.lesson.createMany({
    data: [
      {
        title: "Overview of Court Registry",
        content: "Understanding the organizational hierarchy and key roles within a court registry.",
        moduleId: mod1.id,
        orderIndex: 1,
        duration: 15,
        videoSource: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
      {
        title: "Roles & Responsibilities",
        content: "Detailed breakdown of staff roles from assistants to registrars.",
        moduleId: mod1.id,
        orderIndex: 2,
        duration: 20,
        videoSource: "YOUTUBE",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      },
    ],
    skipDuplicates: true,
  });

  // Enroll learner in course 1
  await prisma.enrollment.upsert({
    where: {
      userId_courseId: { userId: learner.id, courseId: course1.id },
    },
    update: {},
    create: {
      userId: learner.id,
      courseId: course1.id,
    },
  });

  console.log("✅ Demo seed completed successfully");
  console.log("");
  console.log("Demo Credentials (password: demo1234 for all):");
  console.log("  Admin:   admin@demo.com");
  console.log("  Tutor:   tutor@demo.com");
  console.log("  Learner: learner@demo.com");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
