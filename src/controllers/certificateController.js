const { PrismaClient } = require("@prisma/client");
const PDFDocument = require("pdfkit");
const QRCode = require("qrcode");
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
                questions: true,
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
                module => {
                    // If no quiz questions are configured for this module, bypass the quiz pass requirement
                    if (!module.questions || module.questions.length === 0) {
                        return true;
                    }
                    return module.quizAttempts.length > 0;
                }
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
            margin: 0
        });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename=${certificate.certificateNumber}.pdf`
        );

        doc.pipe(res);

        // --- DRAW ARTISTIC BACKGROUND & BORDERS ---
        
        // 1. Thick Maroon Outer Border (15pt width, inset slightly)
        doc.save();
        doc.rect(15, 15, 811.89, 565.28)
           .lineWidth(15)
           .strokeColor("#580f24") // Burgundy / Maroon
           .stroke();
        doc.restore();

        // 2. Double Golden Inner Borders
        doc.save();
        doc.rect(30, 30, 781.89, 535.28)
           .lineWidth(3)
           .strokeColor("#d4af37") // Gold
           .stroke();
        
        doc.rect(36, 36, 769.89, 523.28)
           .lineWidth(1)
           .strokeColor("#d4af37") // Gold
           .stroke();
        doc.restore();

        // 3. Artistic Burgundy/Gold Waves on Left Side
        doc.save();
        
        // Lighter Gold Wave (Behind)
        doc.fillColor("#d4af37");
        doc.moveTo(37, 37)
           .lineTo(37, 558)
           .lineTo(80, 558)
           .quadraticCurveTo(30, 400, 85, 250)
           .quadraticCurveTo(120, 120, 60, 37)
           .closePath()
           .fill();

        // Dark Burgundy Wave (Main)
        doc.fillColor("#7c1a35");
        doc.moveTo(37, 37)
           .lineTo(110, 37)
           .quadraticCurveTo(150, 180, 85, 330)
           .quadraticCurveTo(45, 460, 120, 558)
           .lineTo(37, 558)
           .closePath()
           .fill();
        
        doc.restore();

        // 4. Golden Accent Dots along Left Wave
        doc.save();
        doc.fillColor("#d4af37");
        const dotCoordinates = [
          {x: 105, y: 100},
          {x: 115, y: 150},
          {x: 108, y: 200},
          {x: 92, y: 250},
          {x: 78, y: 300},
          {x: 70, y: 350},
          {x: 75, y: 400},
          {x: 92, y: 450},
          {x: 112, y: 500}
        ];
        dotCoordinates.forEach(dot => {
          doc.circle(dot.x, dot.y, 3.5).fill();
        });
        doc.restore();

        // 5. Golden Seal / Ribbon on the Right Side
        doc.save();
        // Burgundy Ribbons
        doc.fillColor("#7c1a35");
        doc.moveTo(675, 270).lineTo(660, 360).lineTo(685, 345).lineTo(710, 360).lineTo(695, 270).closePath().fill();
        doc.moveTo(705, 270).lineTo(720, 360).lineTo(745, 345).lineTo(770, 360).lineTo(755, 270).closePath().fill();
        
        // Gold Seal base
        doc.fillColor("#e5c158");
        doc.circle(715, 250, 45).fill();
        
        // Inner Maroon Border
        doc.circle(715, 250, 38).lineWidth(1.5).strokeColor("#7c1a35").stroke();
        
        // Dotted Inner Ring
        doc.save();
        doc.dash(3, { space: 2 });
        doc.circle(715, 250, 34).lineWidth(1).strokeColor("#d4af37").stroke();
        doc.restore();
        
        // Text inside Seal
        doc.fillColor("#7c1a35");
        doc.font("Helvetica-Bold").fontSize(9);
        doc.text("EXCELLENCE", 670, 240, { width: 90, align: "center" });
        doc.fontSize(7.5);
        doc.text("AWARD", 670, 253, { width: 90, align: "center" });
        doc.restore();

        // --- TYPOGRAPHY & LAYOUT ---
        
        // 1. Certificate Title
        doc.save();
        doc.fillColor("#1e293b");
        doc.font("Times-Bold").fontSize(34);
        doc.text("CERTIFICATE OF COMPLETION", 140, 80, { width: 560, align: "center" });
        doc.restore();

        // 2. Subtitle
        doc.save();
        doc.fillColor("#475569");
        doc.font("Times-Italic").fontSize(16);
        doc.text("This is proudly presented to", 140, 145, { width: 560, align: "center" });
        doc.restore();

        // 3. Recipient Name
        doc.save();
        doc.fillColor("#7c1a35");
        doc.font("Times-BoldItalic").fontSize(34);
        doc.text(certificate.user.name || "Learner", 140, 185, { width: 560, align: "center" });
        
        // Gold Underline below Name
        doc.lineWidth(1.5).strokeColor("#d4af37");
        doc.moveTo(250, 230).lineTo(590, 230).stroke();
        doc.restore();

        // 4. Description Subtitle
        doc.save();
        doc.fillColor("#475569");
        doc.font("Times-Italic").fontSize(15);
        doc.text("for successfully completing the course", 140, 255, { width: 560, align: "center" });
        doc.restore();

        // 5. Course Title
        doc.save();
        doc.fillColor("#0f172a");
        doc.font("Times-Bold").fontSize(26);
        doc.text(certificate.course.title, 140, 290, { width: 560, align: "center" });
        doc.restore();

        // 6. Certificate Details (ID and info)
        doc.save();
        doc.fillColor("#64748b");
        doc.font("Helvetica").fontSize(10);
        doc.text(`Certificate No: ${certificate.certificateNumber}`, 140, 345, { width: 560, align: "center" });
        doc.restore();

        // Generate and Embed QR Code for Verification
        try {
          const verifyUrl = `http://localhost:3000/verify-certificate.html?number=${certificate.certificateNumber}`;
          const qrBuffer = await QRCode.toBuffer(verifyUrl, {
            margin: 1,
            color: {
              dark: "#1e293b",
              light: "#ffffff"
            }
          });
          doc.image(qrBuffer, 386, 370, { width: 70 });
        } catch (qrErr) {
          console.error("Failed to generate QR Code for certificate:", qrErr);
        }

        // 7. Signature & Date Lines
        doc.save();
        doc.lineWidth(1).strokeColor("#d4af37");
        // Registrar / Signature line (Left)
        doc.moveTo(200, 480).lineTo(380, 480).stroke();
        // Date line (Right)
        doc.moveTo(460, 480).lineTo(640, 480).stroke();

        // Date text on top of Date Line
        const issueDate = new Date(certificate.issuedAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric"
        });
        doc.fillColor("#1e293b").font("Times-Roman").fontSize(12);
        doc.text(issueDate, 460, 460, { width: 180, align: "center" });

        // Organization Registrar text on top of Signature Line
        doc.text("High Court of Kerala", 200, 460, { width: 180, align: "center" });

        // Signature Labels
        doc.fillColor("#475569").font("Helvetica-Bold").fontSize(10);
        doc.text("REGISTRAR", 200, 490, { width: 180, align: "center" });
        doc.text("DATE ISSUED", 460, 490, { width: 180, align: "center" });
        doc.restore();

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

exports.verifyCertificate = async (req, res) => {
    try {
        const { number } = req.params;

        const certificate = await prisma.certificate.findUnique({
            where: {
                certificateNumber: number
            },
            include: {
                course: {
                    select: {
                        title: true,
                        description: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        email: true
                    }
                }
            }
        });

        if (!certificate) {
            return res.status(404).json({
                valid: false,
                message: "Certificate not found or invalid"
            });
        }

        res.json({
            valid: true,
            certificateNumber: certificate.certificateNumber,
            issuedAt: certificate.issuedAt,
            recipientName: certificate.user.name,
            courseTitle: certificate.course.title,
            courseDescription: certificate.course.description
        });

    } catch (error) {
        console.error("VERIFY CERTIFICATE ERROR:", error);
        res.status(500).json({
            message: "Error verifying certificate",
            error: error.message
        });
    }
};