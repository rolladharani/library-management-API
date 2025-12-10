// src/routes/bookRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/bookController");

router.post("/", controller.createBook);
router.get("/", controller.getAllBooks);
router.get("/available", controller.getAvailableBooks);
router.get("/:id", controller.getBookById);
router.put("/:id", controller.updateBook);
router.delete("/:id", controller.deleteBook);

module.exports = router;
