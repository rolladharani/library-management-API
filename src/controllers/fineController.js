// src/controllers/fineController.js
const { Fine, Member, Transaction } = require("../models");
const { Op } = require("sequelize");
const { updateMemberSuspension } = require("../services/memberService"); // NEW

/**
 * List all fines (optionally filter unpaid)
 * GET /fines?status=unpaid
 */
const listFines = async (req, res) => {
  try {
    const { status } = req.query; // 'unpaid' or 'all'
    const where = {};
    if (status === "unpaid") where.paid_at = null;

    const fines = await Fine.findAll({
      where,
      include: [
        { model: Member, attributes: ["id", "name", "email"] },
        { model: Transaction, attributes: ["id", "borrowed_at", "due_date"] }
      ],
      order: [["createdAt", "DESC"]]
    });
    return res.json(fines);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Pay a fine: mark paid_at and return updated fine
 * POST /fines/:id/pay
 */
const payFine = async (req, res) => {
  try {
    const fineId = req.params.id;
    const fine = await Fine.findByPk(fineId);
    if (!fine) return res.status(404).json({ error: "Fine not found" });
    if (fine.paid_at) return res.status(400).json({ error: "Fine already paid" });

    fine.paid_at = new Date();
    await fine.save();

    // Optionally, after paying, check and unsuspend member if applicable:
    const unpaid = await Fine.findOne({ where: { member_id: fine.member_id, paid_at: null } });
    if (!unpaid) {
      const member = await Member.findByPk(fine.member_id);
      if (member && member.status === "suspended") {
        // Only unsuspend if business rules allow; here we unsuspend automatically.
        member.status = "active";
        await member.save();
      }
    }

    // ⭐ ADD: recalculate suspension state after fine payment
    try {
      await updateMemberSuspension(fine.member_id);
    } catch (e) {
      console.error("updateMemberSuspension error after fine payment:", e);
    }

    return res.json(fine);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  listFines,
  payFine
};
