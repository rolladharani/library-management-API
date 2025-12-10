// src/controllers/bookController.js
const { Book } = require("../models");

const createBook = async (req, res) => {
  try {
    const { isbn, title, author, category, total_copies } = req.body;
    if (!isbn || !title || !author) return res.status(400).json({ error: "isbn, title, author required" });
    const book = await Book.create({
      isbn, title, author, category,
      total_copies: total_copies || 1,
      available_copies: total_copies || 1
    });
    return res.status(201).json(book);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    return res.json(books);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getAvailableBooks = async (req, res) => {
  try {
    const books = await Book.findAll({ where: { status: "available", available_copies: { [require("sequelize").Op.gt]: 0 } } });
    return res.json(books);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    return res.json(book);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    const updates = req.body;
    // if total_copies changes, optionally adjust available_copies (simple: keep available as-is)
    await book.update(updates);
    return res.json(book);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: "Book not found" });
    await book.destroy();
    return res.json({ message: "Book deleted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createBook, getAllBooks, getAvailableBooks, getBookById, updateBook, deleteBook
};
