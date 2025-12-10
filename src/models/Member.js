const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Member = sequelize.define("Member", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  membership_number: { type: DataTypes.STRING, allowNull: false, unique: true },
  status: {
    type: DataTypes.ENUM("active", "suspended"),
    defaultValue: "active"
  }
}, {
  tableName: "members",
  timestamps: true
});

module.exports = Member;
