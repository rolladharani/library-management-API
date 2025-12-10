// src/routes/memberRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/memberController");

// Create member
router.post("/", controller.createMember);

// CRUD
router.get("/", controller.getAllMembers);
router.get("/:id", controller.getMemberById);
router.put("/:id", controller.updateMember);
router.delete("/:id", controller.deleteMember);

// Borrowed list for a member
router.get("/:id/borrowed", controller.getMemberBorrowed);

module.exports = router;
