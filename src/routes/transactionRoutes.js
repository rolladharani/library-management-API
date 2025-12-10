// src/routes/transactionRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/transactionController");

// Borrow a book
router.post("/borrow", controller.borrowBook);

// Return a book (transaction id in path)
router.post("/:id/return", controller.returnBook);

// List overdue transactions
router.get("/overdue", controller.getOverdueTransactions);

module.exports = router;
