// src/routes/fineRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/fineController");

// List fines (optionally filter unpaid: ?status=unpaid)
router.get("/", controller.listFines);

// Pay a fine
router.post("/:id/pay", controller.payFine);

module.exports = router;
