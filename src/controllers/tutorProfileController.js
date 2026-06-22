const prisma = require("../prisma");

exports.getTutorProfile = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: user not found in token"
            });
        }

        const tutor = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                section: true,
                phone: true,
                designation: true,
                profileImage: true
            }
        });

        if (!tutor) {
            return res.status(404).json({ message: "Tutor not found" });
        }

        const tutorName = tutor.name || "Tutor";

        res.json({
            id: tutor.id,
            fullName: tutorName,
            email: tutor.email,
            section: tutor.section || "",
            phone: tutor.phone || "",
            designation: tutor.designation || "",
            role: tutor.role,
            profileImage: tutor.profileImage,
            avatar: tutorName.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        });

    } catch (error) {
        console.error("GET TUTOR PROFILE ERROR:", error);
        res.status(500).json({
            message: "Error fetching tutor profile",
            error: error.message
        });
    }
};

exports.updateTutorProfile = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized: user not found in token"
            });
        }

        const { fullName, email, phone, section, designation } = req.body;

        const updatedTutor = await prisma.user.update({
            where: { id: userId },
            data: {
                name: fullName,
                email,
                phone,
                section,
                designation
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