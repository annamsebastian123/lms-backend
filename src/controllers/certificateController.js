const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getMyCertificates = async (req, res) => {
    try {
        const certificates = await prisma.certificate.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                course: {
                    select: {
                        title: true
                    }
                }
            },
            orderBy: {
                issuedAt: "desc"
            }
        });

        res.json(certificates);

    } catch (error) {
        console.error("GET CERTIFICATES ERROR:", error);
        res.status(500).json({
            message: "Error fetching certificates",
            error: error.message
        });
    }
};