const prisma = require('../lib/prisma');
const config = require('../config');
const { createNotification } = require('../services/notificationService');
const { queueEmail, processEmailQueue } = require('../services/emailService');
const { DEFAULT_RULES } = require('./ruleDefaults');
const { RULE_HANDLERS, TYPE_BY_CODE } = require('./rules');
const {
  mergeConfig,
  resolveTargetLevel,
  shouldEscalateLevel,
  resolveAssignee,
  buildNotificationCopy,
  LOG_ACTIONS,
} = require('./workflow');

async function ensureDefaultRules() {
  for (const rule of DEFAULT_RULES) {
    await prisma.escalationRule.upsert({
      where: { code: rule.code },
      create: {
        code: rule.code,
        name: rule.name,
        description: rule.description,
        config: rule.config,
        isEnabled: true,
      },
      update: {},
    });
  }
}

async function writeLog(escalationId, { ruleId, action, level, message, metadata }) {
  return prisma.escalationLog.create({
    data: { escalationId, ruleId, action, level, message, metadata },
  });
}

async function getHrAdmin() {
  return prisma.user.findFirst({
    where: { role: { name: 'admin' }, isActive: true },
    orderBy: { id: 'asc' },
  });
}

async function notifyAndEmail({ escalation, notifyUser, copy, ruleId }) {
  if (!notifyUser) return;
  await createNotification({
    userId: notifyUser.id,
    title: copy.title,
    message: copy.message,
    type: 'escalation',
    link: copy.link,
  });
  const emailBody = [
    '<motiondiv style="font-family:Inter,sans-serif;max-width:560px">',
    '<h2 style="color:#059669">', copy.title, '</h2>',
    '<p>', copy.message, '</p>',
    '<p><a href="', copy.link, '">Open GoalSync AI</a></p>',
    '</motiondiv>',
  ].join('').replace(/motiondiv/g, 'motionmotionmotionmotionmotionmotionmotionmotionmotiondiv').replace(/motionmotionmotionmotionmotionmotionmotionmotionmotiondiv/g, 'div');
  await queueEmail({
    userId: notifyUser.id,
    toEmail: notifyUser.email,
    subject: copy.title,
    body: emailBody,
    escalationId: escalation.id,
  });
  await writeLog(escalation.id, {
    ruleId,
    action: LOG_ACTIONS.EMAIL_QUEUED,
    level: escalation.level,
    message: 'Queued email to ' + notifyUser.email,
  });
}

async function processViolation({
  violation,
  rule,
  cycle,
  hrAdmin,
  results,
}) {
  const ruleConfig = mergeConfig(rule.config);
  const type = TYPE_BY_CODE[violation.ruleCode] || violation.ruleCode;
  const employee = violation.employee;
  const manager = violation.manager;
  const employeeName = `${employee.firstName} ${employee.lastName}`;

  let escalation = await prisma.escalation.findFirst({
    where: {
      userId: violation.userId,
      cycleId: cycle.id,
      type,
      status: { in: ['open', 'in_progress'] },
    },
  });

  const initialLevel = ruleConfig.initialLevel || 'employee';

  if (!escalation) {
    const assignee = resolveAssignee({
      level: initialLevel,
      employee,
      manager,
      hrAdmin,
    });

    escalation = await prisma.escalation.create({
      data: {
        userId: violation.userId,
        cycleId: cycle.id,
        ruleId: rule.id,
        type,
        level: initialLevel,
        reason: violation.reason,
        status: 'open',
        escalatedToId: assignee.escalatedToId,
        assignedHrId: assignee.assignedHrId,
        lastNotifiedAt: new Date(),
        nextRetryAt: new Date(Date.now() + ruleConfig.retryIntervalHours * 60 * 60 * 1000),
      },
    });

    await writeLog(escalation.id, {
      ruleId: rule.id,
      action: LOG_ACTIONS.CREATED,
      level: initialLevel,
      message: violation.reason,
      metadata: violation.metadata,
    });

    results.created++;
  } else if (shouldEscalateLevel(escalation, ruleConfig)) {
    const newLevel = resolveTargetLevel(escalation, ruleConfig);
    const assignee = resolveAssignee({ level: newLevel, employee, manager, hrAdmin });

    escalation = await prisma.escalation.update({
      where: { id: escalation.id },
      data: {
        level: newLevel,
        status: 'in_progress',
        escalatedToId: assignee.escalatedToId,
        assignedHrId: assignee.assignedHrId,
        retryCount: { increment: 1 },
      },
    });

    await writeLog(escalation.id, {
      ruleId: rule.id,
      action: LOG_ACTIONS.ESCALATED,
      level: newLevel,
      message: `Escalated to ${newLevel} level`,
    });

    results.escalated++;
  } else if (
    escalation.retryCount < ruleConfig.maxRetries &&
    escalation.nextRetryAt &&
    new Date(escalation.nextRetryAt) <= new Date()
  ) {
    escalation = await prisma.escalation.update({
      where: { id: escalation.id },
      data: {
        retryCount: { increment: 1 },
        nextRetryAt: new Date(Date.now() + ruleConfig.retryIntervalHours * 60 * 60 * 1000),
      },
    });

    await writeLog(escalation.id, {
      ruleId: rule.id,
      action: LOG_ACTIONS.RETRY,
      level: escalation.level,
      message: `Retry notification #${escalation.retryCount}`,
    });

    results.retried++;
  } else {
    return;
  }

  const targetLevel = escalation.level;
  const assignee = resolveAssignee({ level: targetLevel, employee, manager, hrAdmin });
  const notifyUser =
    targetLevel === 'employee'
      ? employee
      : targetLevel === 'manager'
        ? manager || hrAdmin
        : hrAdmin;

  const copy = buildNotificationCopy({
    level: targetLevel,
    type,
    employeeName,
    reason: violation.reason,
    appUrl: config.escalation.appUrl,
  });

  if (notifyUser) {
    await notifyAndEmail({ escalation, notifyUser, copy, ruleId: rule.id });
    await prisma.escalation.update({
      where: { id: escalation.id },
      data: { lastNotifiedAt: new Date() },
    });
    results.notified++;
  }
}

async function runEscalationEngine() {
  await ensureDefaultRules();

  const cycle = await prisma.performanceCycle.findFirst({ where: { isActive: true } });
  if (!cycle) {
    return { created: 0, escalated: 0, notified: 0, retried: 0, emails: {}, message: 'No active cycle' };
  }

  const hrAdmin = await getHrAdmin();
  const rules = await prisma.escalationRule.findMany({ where: { isEnabled: true } });

  const results = {
    created: 0,
    escalated: 0,
    notified: 0,
    retried: 0,
    cycleId: cycle.id,
    ranAt: new Date().toISOString(),
  };

  for (const rule of rules) {
    const handler = RULE_HANDLERS[rule.code];
    if (!handler) continue;

    const violations = await handler.findViolations({
      prisma,
      cycle,
      config: mergeConfig(rule.config),
    });

    for (const violation of violations) {
      try {
        await processViolation({ violation, rule, cycle, hrAdmin, results });
      } catch (err) {
        console.error(`[escalation] rule ${rule.code} user ${violation.userId}:`, err.message);
      }
    }
  }

  results.emails = await processEmailQueue();
  return results;
}

module.exports = {
  runEscalationEngine,
  ensureDefaultRules,
  processEmailQueue,
};
