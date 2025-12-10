// src/controllers/memberController.js
const { Member, Transaction, Book } = require("../models");
const { Op } = require("sequelize");

const createMember = async (req, res) => {
  try {
    const { name, email, membership_number } = req.body;
    if (!name || !email || !membership_number) {
      return res.status(400).json({ error: "name, email and membership_number are required" });
    }

    const member = await Member.create({ name, email, membership_number });
    return res.status(201).json(member);
  } catch (err) {
    console.error(err);
    // handle unique constraint error (email or membership_number)
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email or membership_number already exists" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

const getAllMembers = async (req, res) => {
  try {
    const members = await Member.findAll();
    return res.json(members);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getMemberById = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });
    return res.json(member);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const updateMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });

    await member.update(req.body);
    return res.json(member);
  } catch (err) {
    console.error(err);
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({ error: "Email or membership_number already exists" });
    }
    return res.status(500).json({ error: "Server error" });
  }
};

const deleteMember = async (req, res) => {
  try {
    const member = await Member.findByPk(req.params.id);
    if (!member) return res.status(404).json({ error: "Member not found" });

    await member.destroy();
    return res.json({ message: "Member deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * GET /members/:id/borrowed
 * Returns active transactions for a member and includes the Book info
 */
const getMemberBorrowed = async (req, res) => {
  try {
    const memberId = req.params.id;
    // confirm member exists first
    const member = await Member.findByPk(memberId);
    if (!member) return res.status(404).json({ error: "Member not found" });

    const transactions = await Transaction.findAll({
      where: {
        member_id: memberId,
        status: { [Op.in]: ["active", "overdue"] } // active borrows and overdue
      },
      include: [
        { model: Book, attributes: ["id", "title", "author", "isbn", "category"] }
      ],
      order: [["borrowed_at", "DESC"]]
    });

    return res.json(transactions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
  getMemberBorrowed
};
