const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getTutorProfile = async (req, res) => {
    try {
        const tutor = await prisma.user.findFirst({
            where: {
                role: "TUTOR"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        const tutorName = tutor.name || "Tutor";

        res.json({
            fullName: tutorName,
            email: tutor.email,
            department: "High Court of Kerala",
            phone: "",
            role: tutor.role,
            avatar: tutorName
                .split(" ")
                .map(word => word[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching tutor profile" });
    }
};

exports.updateTutorProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;

        if (!fullName || !email) {
            return res.status(400).json({ message: "Name and email are required" });
        }

        const tutor = await prisma.user.findFirst({
            where: {
                role: "TUTOR"
            }
        });

        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        const updatedTutor = await prisma.user.update({
            where: {
                id: tutor.id
            },
            data: {
                name: fullName,
                email: email
            }
        });

        res.json({
            message: "Tutor profile updated successfully",
            profile: updatedTutor
        });

    } catch (error) {
        console.error("UPDATE TUTOR PROFILE ERROR:", error);
        res.status(500).json({
            message: "Error updating tutor profile",
            error: error.message
        });
    }
};