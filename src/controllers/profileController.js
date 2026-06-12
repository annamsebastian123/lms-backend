const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await prisma.user.findFirst({
            where: {
                role: "ADMIN"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        res.json({
            fullName: admin.name,
            email: admin.email,
            department: "High Court of Kerala",
            phone: "",
            role: admin.role,
            avatar: admin.name
                .split(" ")
                .map(word => word[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
        });

    } catch (error) {
        res.status(500).json({ message: "Error fetching admin profile" });
    }
};
exports.updateAdminProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;

        const admin = await prisma.user.findFirst({
            where: {
                role: "ADMIN"
            }
        });

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        const updatedAdmin = await prisma.user.update({
            where: {
                id: admin.id
            },
            data: {
                name: fullName,
                email: email
            }
        });

        res.json({
            message: "Profile updated successfully",
            profile: updatedAdmin
        });

     } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({
        message: "Error updating admin profile",
        error: error.message
    });
}
};
exports.getLearnerProfile = async (req, res) => {
    try {
        const learner = await prisma.user.findUnique({
            where: {
                id: req.user.id
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        if (!learner) {
            return res.status(404).json({ message: "Learner not found" });
        }

        const learnerName = learner.name || "Learner";

        res.json({
            fullName: learnerName,
            email: learner.email,
            department: "Registry Department",
            phone: "",
            role: learner.role,
            avatar: learnerName
                .split(" ")
                .map(word => word[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
        });

    } catch (error) {
        console.error("GET LEARNER PROFILE ERROR:", error);
        res.status(500).json({
            message: "Error fetching learner profile",
            error: error.message
        });
    }
};

exports.updateLearnerProfile = async (req, res) => {
    try {
        const { fullName, email } = req.body;

        const updatedLearner = await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                name: fullName,
                email: email
            }
        });

        res.json({
            message: "Learner profile updated successfully",
            profile: updatedLearner
        });

    } catch (error) {
        console.error("UPDATE LEARNER PROFILE ERROR:", error);
        res.status(500).json({
            message: "Error updating learner profile",
            error: error.message
        });
    }
};