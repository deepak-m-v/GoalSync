const prisma = require('../lib/prisma');

async function getTeam(managerId) {
  return prisma.user.findMany({
    where: { managerId, isActive: true },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      goals: { select: { id: true, status: true } },
      goalApprovals: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { status: true },
      },
    },
  });
}

module.exports = { getTeam };
