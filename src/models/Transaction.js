const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Transaction = sequelize.define("Transaction", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  borrowed_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  due_date: { type: DataTypes.DATE, allowNull: false },
  returned_at: { type: DataTypes.DATE, allowNull: true },

  status: {
    type: DataTypes.ENUM("active", "returned", "overdue"),
    defaultValue: "active"
  }
}, {
  tableName: "transactions",
  timestamps: true
});

module.exports = Transaction;
