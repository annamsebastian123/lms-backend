const { PrismaClient } = require('@prisma/client');
(async () => {
  const prisma = new PrismaClient();
  try {
    const count = await prisma.course.count();
    console.log('COURSE_COUNT:' + count);
    if (count > 0) {
      const rows = await prisma.course.findMany({ take: 5 });
      console.log(JSON.stringify(rows, null, 2));
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
