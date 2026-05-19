const AppError = require('../utils/AppError');

function notFound(req, res) {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errors = err.errors || null;

  if (err.code === 'P2002') {
    status = 409;
    message = 'A record with this value already exists';
  }
  if (err.code === 'P2025') {
    status = 404;
    message = 'Record not found';
  }

  if (process.env.NODE_ENV === 'development' && status === 500 && !err.isOperational) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === 'development' && !err.isOperational && { stack: err.stack }),
  });
}

module.exports = { notFound, errorHandler, AppError };
