// src/models/index.js
const sequelize = require("../config/db");

const Book = require("./Book");
const Member = require("./Member");
const Transaction = require("./Transaction");
const Fine = require("./Fine");

// Relationships
Book.hasMany(Transaction, { foreignKey: "book_id" });
Transaction.belongsTo(Book, { foreignKey: "book_id" });

Member.hasMany(Transaction, { foreignKey: "member_id" });
Transaction.belongsTo(Member, { foreignKey: "member_id" });

Member.hasMany(Fine, { foreignKey: "member_id" });
Fine.belongsTo(Member, { foreignKey: "member_id" });

Transaction.hasMany(Fine, { foreignKey: "transaction_id" });
Fine.belongsTo(Transaction, { foreignKey: "transaction_id" });

// Export models + sync function
module.exports = {
  sequelize,
  Book,
  Member,
  Transaction,
  Fine,
  syncModels: async () => {
    // Use plain sync() in normal runs. If you need schema changes during dev,
    // run sync({ force: true }) intentionally (will DROP tables!) or use migrations.
    await sequelize.sync();
    console.log("All models synced.");
  }
};
