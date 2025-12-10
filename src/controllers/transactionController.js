// src/controllers/transactionController.js
const { Book, Member, Transaction, Fine } = require("../models");
const sequelize = require("../config/db");
const { Op } = require("sequelize");
const { updateMemberSuspension } = require("../services/memberService"); // NEW

// Configurable business rules
const MAX_BORROW = 3;
const LOAN_DAYS = 14;
const FINE_PER_DAY = 0.5;

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const borrowBook = async (req, res) => {
  const { member_id, book_id } = req.body;
  if (!member_id || !book_id) return res.status(400).json({ error: "member_id and book_id are required" });

  // Use a DB transaction to keep operations atomic
  const t = await sequelize.transaction();
  try {
    const member = await Member.findByPk(member_id, { transaction: t });
    if (!member) {
      await t.rollback();
      return res.status(404).json({ error: "Member not found" });
    }
    if (member.status !== "active") {
      await t.rollback();
      return res.status(400).json({ error: "Member is not active" });
    }

    // Check unpaid fines
    const unpaidFine = await Fine.findOne({
      where: { member_id, paid_at: null },
      transaction: t
    });
    if (unpaidFine) {
      await t.rollback();
      return res.status(400).json({ error: "Member has unpaid fines" });
    }

    // Count active/overdue borrows
    const activeCount = await Transaction.count({
      where: { member_id, status: { [Op.in]: ["active", "overdue"] } },
      transaction: t
    });
    if (activeCount >= MAX_BORROW) {
      await t.rollback();
      return res.status(400).json({ error: `Member already has ${MAX_BORROW} borrowed books` });
    }

    const book = await Book.findByPk(book_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!book) {
      await t.rollback();
      return res.status(404).json({ error: "Book not found" });
    }
    if (book.available_copies < 1) {
      await t.rollback();
      return res.status(400).json({ error: "No available copies to borrow" });
    }

    const now = new Date();
    const due = addDays(now, LOAN_DAYS);

    const transactionRecord = await Transaction.create({
      book_id,
      member_id,
      borrowed_at: now,
      due_date: due,
      status: "active"
    }, { transaction: t });

    // Decrement available copies
    await book.update({
      available_copies: book.available_copies - 1,
      status: (book.available_copies - 1) === 0 ? "borrowed" : "available"
    }, { transaction: t });

    await t.commit();

    // ⭐ ADD: update member suspension status after borrowing
    try {
      await updateMemberSuspension(member_id);
    } catch (e) {
      console.error("updateMemberSuspension error after borrow:", e);
    }

    return res.status(201).json(transactionRecord);
  } catch (err) {
    console.error(err);
    if (t) await t.rollback();
    return res.status(500).json({ error: "Server error" });
  }
};

const returnBook = async (req, res) => {
  const transactionId = req.params.id;
  const t = await sequelize.transaction();
  try {
    const tx = await Transaction.findByPk(transactionId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!tx) {
      await t.rollback();
      return res.status(404).json({ error: "Transaction not found" });
    }
    if (tx.status === "returned") {
      await t.rollback();
      return res.status(400).json({ error: "Transaction already returned" });
    }

    const book = await Book.findByPk(tx.book_id, { transaction: t, lock: t.LOCK.UPDATE });
    if (!book) {
      await t.rollback();
      return res.status(404).json({ error: "Associated book not found" });
    }

    const now = new Date();
    // Update transaction as returned
    tx.returned_at = now;

    // Determine overdue
    const due = new Date(tx.due_date);
    let fineCreated = null;
    if (now > due) {
      const msPerDay = 1000 * 60 * 60 * 24;
      // Round up days overdue: use Math.ceil (change to Math.floor if you prefer)
      const daysOverdue = Math.ceil((now - due) / msPerDay);
      const amount = parseFloat((daysOverdue * FINE_PER_DAY).toFixed(2));

      fineCreated = await Fine.create({
        member_id: tx.member_id,
        transaction_id: tx.id,
        amount,
        paid_at: null
      }, { transaction: t });
      tx.status = "overdue"; // mark as overdue initially, will change to returned after processing
    } else {
      tx.status = "returned";
    }

    await tx.save({ transaction: t });

    // Increment available copies
    await book.update({
      available_copies: book.available_copies + 1,
      status: "available"
    }, { transaction: t });

    // If overdue but fine created, leave it; otherwise set status returned
    if (tx.status !== "returned") {
      // If we created a fine, we still set transaction.status to 'returned' logically because book returned,
      // but we keep track of fine separately. To follow previous enum, set returned and create fine.
      tx.status = "returned";
      await tx.save({ transaction: t });
    }

    await t.commit();

    // ⭐ ADD: update member suspension status after return
    try {
      await updateMemberSuspension(tx.member_id);
    } catch (e) {
      console.error("updateMemberSuspension error after return:", e);
    }

    return res.json({ transaction: tx, fine: fineCreated || null });
  } catch (err) {
    console.error(err);
    if (t) await t.rollback();
    return res.status(500).json({ error: "Server error" });
  }
};

// List overdue transactions (not yet returned and past due)
const getOverdueTransactions = async (req, res) => {
  try {
    const now = new Date();
    const overdue = await Transaction.findAll({
      where: {
        due_date: { [Op.lt]: now },
        status: "active"
      },
      include: [
        { model: Book, attributes: ["id", "title", "author"] },
        { model: Member, attributes: ["id", "name", "email", "membership_number"] }
      ],
      order: [["due_date", "ASC"]]
    });

    // Optionally update their status to 'overdue' (we won't auto-update here to avoid state changes without action)
    return res.json(overdue);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  borrowBook,
  returnBook,
  getOverdueTransactions
};
