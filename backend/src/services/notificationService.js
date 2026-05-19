const prisma = require('../lib/prisma');

async function createNotification({ userId, title, message, type = 'system', link }) {
  return prisma.notification.create({
    data: { userId, title, message, type, link },
  });
}

async function listForUser(userId, { unreadOnly = false, limit = 50 } = {}) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly && { isRead: false }) },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

async function markRead(id, userId) {
  return prisma.notification.updateMany({
    where: { id: BigInt(id), userId },
    data: { isRead: true, readAt: new Date() },
  });
}

async function markAllRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
}

module.exports = { createNotification, listForUser, markRead, markAllRead };
