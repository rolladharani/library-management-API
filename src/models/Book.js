const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Book = sequelize.define("Book", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  isbn: { type: DataTypes.STRING, allowNull: false, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  author: { type: DataTypes.STRING, allowNull: false },
  category: { type: DataTypes.STRING },
  status: {
    type: DataTypes.ENUM("available", "borrowed", "reserved", "maintenance"),
    defaultValue: "available"
  },
  total_copies: { type: DataTypes.INTEGER, defaultValue: 1 },
  available_copies: { type: DataTypes.INTEGER, defaultValue: 1 }
}, {
  tableName: "books",
  timestamps: true
});

module.exports = Book;
