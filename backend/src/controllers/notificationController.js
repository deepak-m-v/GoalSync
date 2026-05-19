const notificationService = require('../services/notificationService');
const { listEmailQueue, processEmailQueue } = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await notificationService.listForUser(req.user.id, {
    unreadOnly: req.query.unread === 'true',
  });
  res.json({ success: true, data });
});

const markRead = asyncHandler(async (req, res) => {
  await notificationService.markRead(req.params.id, req.user.id);
  res.json({ success: true, message: 'Marked as read' });
});

const markAllRead = asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  res.json({ success: true, message: 'All notifications marked read' });
});

const emailQueue = asyncHandler(async (req, res) => {
  const data = await listEmailQueue({
    status: req.query.status,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : 50,
  });
  res.json({ success: true, data });
});

const processEmails = asyncHandler(async (req, res) => {
  const data = await processEmailQueue();
  res.json({ success: true, data });
});

module.exports = { list, markRead, markAllRead, emailQueue, processEmails };
