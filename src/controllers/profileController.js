const prisma = require("../prisma");

exports.getAdminProfile = async (req, res) => {
    try {
        const admin = await prisma.user.findUnique({
            where: { id: req.user.id },
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

        if (!admin || admin.role !== "ADMIN") {
            return res.status(404).json({ message: "Admin not found" });
        }

        const adminName = admin.name || "Admin";

        res.json({
            id: admin.id,
            fullName: adminName,
            email: admin.email,
            section: admin.section || "",
            phone: admin.phone || "",
            designation: admin.designation || "",
            role: admin.role,
            profileImage: admin.profileImage,
            avatar: adminName
                .split(" ")
                .map(word => word[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
        });

    } catch (error) {
        console.error("GET ADMIN PROFILE ERROR:", error);
        res.status(500).json({
            message: "Error fetching admin profile",
            error: error.message
        });
    }
};

exports.updateAdminProfile = async (req, res) => {
    try {
        const { fullName, email, phone, section, designation } = req.body;

        const updatedAdmin = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: fullName,
                email,
                phone,
                section,
                designation
            }
        });

        res.json({
            message: "Profile updated successfully",
            profile: updatedAdmin
        });

    } catch (error) {
        console.error("UPDATE ADMIN PROFILE ERROR:", error);
        res.status(500).json({
            message: "Error updating admin profile",
            error: error.message
        });
    }
};

exports.getLearnerProfile = async (req, res) => {
    try {
        const learner = await prisma.user.findUnique({
            where: { id: req.user.id },
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

        if (!learner) {
            return res.status(404).json({ message: "Learner not found" });
        }

        const learnerName = learner.name || "Learner";

        res.json({
            id: learner.id,
            fullName: learnerName,
            email: learner.email,
            section: learner.section || "",
            phone: learner.phone || "",
            designation: learner.designation || "",
            role: learner.role,
            profileImage: learner.profileImage,
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
        const { fullName, email, phone, section, designation } = req.body;

        const updatedLearner = await prisma.user.update({
            where: { id: req.user.id },
            data: {
                name: fullName,
                email,
                phone,
                section,
                 designation: designation || null,
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