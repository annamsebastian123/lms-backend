const { uploadVideo } = require("../services/storageService");
const fs = require("fs");
const path = require("path");
const prisma = require("../prisma");
async function uploadLessonVideo(req, res) {
  console.log("UPLOAD ROUTE HIT");
  console.log("FILE:", req.file);

  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No video file uploaded",
      });
    }

    const key = await uploadVideo(req.file);

    res.json({
      success: true,
      videoKey: key,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Video upload failed",
      error: err.message,
    });
  }
}
async function uploadProfileImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        message: "No profile image uploaded",
      });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

    if (!allowedTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        message: "Only JPG, PNG, or WEBP images are allowed",
      });
    }

    const uploadsDir = path.join(__dirname, "../../uploads/profiles");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const extension = path.extname(req.file.originalname);
    const fileName = `profile-${req.user.id}-${Date.now()}${extension}`;
    const filePath = path.join(uploadsDir, fileName);

    fs.writeFileSync(filePath, req.file.buffer);

    const imageUrl = `/uploads/profiles/${fileName}`;

    const updatedUser = await prisma.user.update({
      where: {
        id: req.user.id,
      },
      data: {
        profileImage: imageUrl,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profileImage: true,
      },
    });

    res.json({
      message: "Profile image uploaded successfully",
      user: updatedUser,
    });

  } catch (err) {
    console.error("PROFILE IMAGE UPLOAD ERROR:", err);

    res.status(500).json({
      message: "Profile image upload failed",
      error: err.message,
    });
  }
}

module.exports = {
  uploadLessonVideo,
  uploadProfileImage,
};