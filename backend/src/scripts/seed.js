const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const db = require('../config/db');

async function seed() {
  const schema = fs.readFileSync(path.join(__dirname, '../../../database/schema.sql'), 'utf8');
  const seedSql = fs.readFileSync(path.join(__dirname, '../../../database/seed.sql'), 'utf8');

  await db.query(schema);
  await db.query(seedSql);

  const hash = await bcrypt.hash('Password123', 10);
  await db.query(
    `UPDATE users SET password_hash = $1 WHERE email IN ($2, $3, $4)`,
    [hash, 'admin@goalsync.com', 'manager@goalsync.com', 'employee@goalsync.com']
  );

  console.log('Database seeded successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
