const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('Password123', 10);

  await prisma.role.createMany({
    data: [
      { name: 'admin', description: 'HR / System Administrator' },
      { name: 'manager', description: 'Team Manager' },
      { name: 'employee', description: 'Individual Contributor' },
    ],
    skipDuplicates: true,
  });

  await prisma.department.createMany({
    data: [
      { name: 'Engineering', code: 'ENG' },
      { name: 'Human Resources', code: 'HR' },
      { name: 'Sales', code: 'SALES' },
      { name: 'Operations', code: 'OPS' },
    ],
    skipDuplicates: true,
  });

  const eng = await prisma.department.findUnique({ where: { code: 'ENG' } });
  const hr = await prisma.department.findUnique({ where: { code: 'HR' } });

  await prisma.performanceCycle.upsert({
    where: { year_name: { year: 2026, name: 'FY 2026' } },
    create: {
      name: 'FY 2026',
      year: 2026,
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-12-31'),
      isActive: true,
    },
    update: { isActive: true },
  });

  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const managerRole = await prisma.role.findUnique({ where: { name: 'manager' } });
  const employeeRole = await prisma.role.findUnique({ where: { name: 'employee' } });

  await prisma.user.upsert({
    where: { email: 'admin@goalsync.com' },
    update: { passwordHash: hash },
    create: {
      email: 'admin@goalsync.com',
      passwordHash: hash,
      firstName: 'Alex',
      lastName: 'Admin',
      roleId: adminRole.id,
      departmentId: hr.id,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@goalsync.com' },
    update: { passwordHash: hash },
    create: {
      email: 'manager@goalsync.com',
      passwordHash: hash,
      firstName: 'Morgan',
      lastName: 'Manager',
      roleId: managerRole.id,
      departmentId: eng.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'employee@goalsync.com' },
    update: { passwordHash: hash, managerId: manager.id },
    create: {
      email: 'employee@goalsync.com',
      passwordHash: hash,
      firstName: 'Jamie',
      lastName: 'Employee',
      roleId: employeeRole.id,
      departmentId: eng.id,
      managerId: manager.id,
    },
  });

  const { ensureDefaultRules } = require('../src/escalation/engine');
  await ensureDefaultRules();

  console.log('Seed complete. Demo password: Password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
