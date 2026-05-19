const config = require('../config');
const AppError = require('../utils/AppError');

function cronAuth(req, res, next) {
  const secret = config.escalation.engineSecret;
  if (!secret) {
    return next(new AppError('Cron secret not configured', 503));
  }
  const header = req.headers['x-cron-secret'] || req.query.secret;
  if (header !== secret) {
    return next(new AppError('Unauthorized cron request', 401));
  }
  next();
}

module.exports = cronAuth;
