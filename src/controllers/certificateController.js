const { PrismaClient } = require("@prisma/client");
const PDFDocument = require("pdfkit");
const prisma = new PrismaClient();

function generateCertificateNumber(id) {
    const year = new Date().getFullYear();
    const paddedId = String(id).padStart(5, "0");

    return `HCK-LMS-${year}-${paddedId}`;
}

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

exports.generateCertificate = async (req, res) => {
    try {
        const userId = req.user.id;
        const courseId = Number(req.params.courseId);

        const enrollment = await prisma.enrollment.findFirst({
            where: {
                userId,
                courseId
            },
            include: {
                course: true,
                user: true
            }
        });

        if (!enrollment) {
            return res.status(404).json({
                message: "You are not enrolled in this course"
            });
        }
        const modules = await prisma.module.findMany({
    where: {
        courseId
    },
    include: {
        quizAttempts: {
            where: {
                userId,
                passed: true
            }
        }
    }
});

const allModulesPassed =
    modules.length > 0 &&
    modules.every(
        module => module.quizAttempts.length > 0
    );

if (!allModulesPassed) {
    return res.status(400).json({
        message:
            "Complete and pass all module quizzes before generating a certificate"
    });
}
        const existingCertificate = await prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId
                }
            },
            include: {
                course: {
                    select: {
                        title: true
                    }
                }
            }
        });

        if (existingCertificate) {
            return res.json(existingCertificate);
        }

        const tempCertificate = await prisma.certificate.create({
            data: {
                userId,
                courseId,
                certificateNumber: `TEMP-${Date.now()}`,
                pdfUrl: null
            },
            include: {
                course: {
                    select: {
                        title: true
                    }
                }
            }
        });

        const certificateNumber = generateCertificateNumber(tempCertificate.id);

        const updatedCertificate = await prisma.certificate.update({
            where: {
                id: tempCertificate.id
            },
            data: {
                certificateNumber,
                pdfUrl: `/api/certificates/${tempCertificate.id}/download`
            },
            include: {
                course: {
                    select: {
                        title: true
                    }
                }
            }
        });

        res.json({
            message: "Certificate generated successfully",
            certificate: updatedCertificate
        });

    } catch (error) {
        console.error("GENERATE CERTIFICATE ERROR:", error);
        res.status(500).json({
            message: "Error generating certificate",
            error: error.message
        });
    }
};

exports.downloadCertificate = async (req, res) => {
    try {
        const certificateId = Number(req.params.id);

        const certificate = await prisma.certificate.findUnique({
            where: {
                id: certificateId
            },
            include: {
                course: true,
                user: true
            }
        });

        if (!certificate) {
            return res.status(404).send("Certificate not found");
        }

        const doc = new PDFDocument({
            size: "A4",
            layout: "landscape",
            margin: 50
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${certificate.certificateNumber}.pdf`
        );

        doc.pipe(res);

        doc
            .fontSize(30)
            .text("Certificate of Completion", {
                align: "center"
            });

        doc.moveDown(1);

        doc
            .fontSize(16)
            .text("This is proudly presented to", {
                align: "center"
            });

        doc.moveDown(1);

        doc
            .fontSize(26)
            .text(certificate.user.name || "Learner", {
                align: "center"
            });

        doc.moveDown(1);

        doc
            .fontSize(16)
            .text("for successfully completing the course", {
                align: "center"
            });

        doc.moveDown(1);

        doc
            .fontSize(24)
            .text(certificate.course.title, {
                align: "center"
            });

        doc.moveDown(2);

        doc
            .fontSize(14)
            .text(`Certificate No: ${certificate.certificateNumber}`, {
                align: "center"
            });

        doc.moveDown(0.5);

        doc
            .fontSize(14)
            .text(`Issued: ${new Date(certificate.issuedAt).toLocaleDateString()}`, {
                align: "center"
            });

        doc.moveDown(2);

        doc
            .fontSize(18)
            .text("High Court of Kerala LMS", {
                align: "center"
            });

        doc.end();

    } catch (error) {
        console.error("DOWNLOAD CERTIFICATE ERROR:", error);
        res.status(500).send("Error downloading certificate");
    }
};
exports.getAllCertificatesForAdmin = async (req, res) => {
    try {
        const certificates = await prisma.certificate.findMany({
            include: {
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                },
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
        console.error("GET ADMIN CERTIFICATES ERROR:", error);
        res.status(500).json({
            message: "Error fetching certificates",
            error: error.message
        });
    }
};