const express = require("express");
const router = express.Router();

const categoryController = require("../controllers/categoryController");
const authMiddleware = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/roleMiddleware");

router.get("/", authMiddleware, categoryController.getCategories);
router.post("/", authMiddleware, authorizeRoles("ADMIN"), categoryController.createCategory);
router.delete("/:id", authMiddleware, authorizeRoles("ADMIN"), categoryController.deleteCategory);

module.exports = router;
