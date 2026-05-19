const app = require('./app');
const config = require('./config');
const prisma = require('./lib/prisma');
const { initFirebase } = require('./lib/firebase');

initFirebase();

const { startEscalationScheduler } = require('./escalation/scheduler');

const server = app.listen(config.port, () => {
  console.log(`GoalSync API v2 on http://localhost:${config.port} [${config.env}]`);
  startEscalationScheduler();
});

async function shutdown() {
  const { stopEscalationScheduler } = require('./escalation/scheduler');
  stopEscalationScheduler();
  await prisma.$disconnect();
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
