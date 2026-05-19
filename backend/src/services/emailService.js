const nodemailer = require('nodemailer');
const prisma = require('../lib/prisma');
const config = require('../config');
const { LOG_ACTIONS } = require('../escalation/constants');

let transporter;

function getTransporter() {
  if (transporter) return transporter;

  if (config.email.smtp?.host) {
    transporter = nodemailer.createTransport({
      host: config.email.smtp.host,
      port: config.email.smtp.port,
      secure: config.email.smtp.secure,
      auth: config.email.smtp.user
        ? { user: config.email.smtp.user, pass: config.email.smtp.pass }
        : undefined,
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
}

async function queueEmail({ userId, toEmail, subject, body, escalationId, scheduledAt }) {
  return prisma.emailQueue.create({
    data: {
      userId,
      toEmail,
      subject,
      body,
      escalationId: escalationId || null,
      scheduledAt: scheduledAt || new Date(),
      status: 'pending',
    },
  });
}

async function sendEmailDirect({ to, subject, html, text }) {
  if (!config.email.enabled) {
    console.log('[email] disabled — would send:', { to, subject });
    return { messageId: 'disabled', preview: true };
  }

  const info = await getTransporter().sendMail({
    from: config.email.from,
    to,
    subject,
    text: text || html?.replace(/<[^>]+>/g, ''),
    html: html || text,
  });

  return info;
}

async function processEmailQueue(limit = 50) {
  const pending = await prisma.emailQueue.findMany({
    where: {
      status: 'pending',
      scheduledAt: { lte: new Date() },
      attempts: { lt: prisma.raw ? undefined : 999 },
    },
    take: limit,
    orderBy: { scheduledAt: 'asc' },
  });

  const filtered = pending.filter((e) => e.attempts < e.maxAttempts);
  const results = { sent: 0, failed: 0, retried: 0 };

  for (const item of filtered) {
    try {
      await sendEmailDirect({
        to: item.toEmail,
        subject: item.subject,
        html: item.body,
      });

      await prisma.emailQueue.update({
        where: { id: item.id },
        data: { status: 'sent', sentAt: new Date(), attempts: { increment: 1 } },
      });

      if (item.escalationId) {
        await prisma.escalationLog.create({
          data: {
            escalationId: item.escalationId,
            action: LOG_ACTIONS.EMAIL_SENT,
            message: `Email sent to ${item.toEmail}`,
            metadata: { emailQueueId: item.id.toString() },
          },
        });
      }

      results.sent++;
    } catch (err) {
      const attempts = item.attempts + 1;
      const failed = attempts >= item.maxAttempts;

      await prisma.emailQueue.update({
        where: { id: item.id },
        data: {
          attempts,
          lastError: err.message,
          status: failed ? 'failed' : 'pending',
          scheduledAt: failed
            ? item.scheduledAt
            : new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      if (item.escalationId) {
        await prisma.escalationLog.create({
          data: {
            escalationId: item.escalationId,
            action: failed ? LOG_ACTIONS.EMAIL_FAILED : LOG_ACTIONS.RETRY,
            message: err.message,
            metadata: { attempt: attempts },
          },
        });
      }

      if (failed) results.failed++;
      else results.retried++;
    }
  }

  return results;
}

async function listEmailQueue({ status, limit = 50 } = {}) {
  return prisma.emailQueue.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  });
}

module.exports = {
  queueEmail,
  sendEmailDirect,
  processEmailQueue,
  listEmailQueue,
};
