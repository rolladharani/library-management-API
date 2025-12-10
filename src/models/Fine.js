const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Fine = sequelize.define("Fine", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amount: { type: DataTypes.DECIMAL(8,2), allowNull: false },
  paid_at: { type: DataTypes.DATE, allowNull: true }
}, {
  tableName: "fines",
  timestamps: true
});

module.exports = Fine;
