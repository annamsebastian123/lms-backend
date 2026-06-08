const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.user.upsert({
        where: { email: "admin@hck.gov.in" },
        update: {},
        create: {
            email: "admin@hck.gov.in",
            name: "Admin User",
            passwordHash: "admin123",
            role: "ADMIN"
        }
    });

    await prisma.course.createMany({
        data: [
            {
                title: "Introduction to JavaScript",
                description: "Learn JavaScript fundamentals including variables, functions, arrays, objects, and DOM manipulation.",
                userId: admin.id
            },
            {
                title: "Web Development with HTML and CSS",
                description: "Learn the basics of building responsive web pages using HTML and CSS.",
                userId: admin.id
            },
            {
                title: "Database Fundamentals",
                description: "Introduction to relational databases, SQL queries, normalization, and database design.",
                userId: admin.id
            }
        ],
        skipDuplicates: true
    });

    console.log("Sample courses inserted successfully");
}

main()
    .catch((e) => {
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });