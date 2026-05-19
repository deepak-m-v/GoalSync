const prisma = require('../lib/prisma');
const asyncHandler = require('../utils/asyncHandler');

const listUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    include: { role: true, department: true },
    orderBy: { lastName: 'asc' },
  });
  const data = users.map((u) => ({
    id: u.id,
    email: u.email,
    first_name: u.firstName,
    last_name: u.lastName,
    is_active: u.isActive,
    role: u.role.name,
    department: u.department?.name,
  }));
  res.json({ success: true, data });
});

module.exports = { listUsers };
