const { Member, Transaction } = require("../models");
const { Op } = require("sequelize");

// suspend if >= 3 overdue books
async function updateMemberSuspension(member_id) {
  const overdueCount = await Transaction.count({
    where: {
      member_id,
      status: "overdue"
    }
  });

  const member = await Member.findByPk(member_id);

  if (!member) return;

  if (overdueCount >= 3) {
    member.status = "suspended";
    await member.save();
  } else if (overdueCount === 0 && member.status === "suspended") {
    member.status = "active";
    await member.save();
  }
}

module.exports = { updateMemberSuspension };
