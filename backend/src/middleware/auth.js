const prisma = require('../lib/prisma');
const { verifyAccessToken } = require('../services/tokenService');
const AppError = require('../utils/AppError');

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const token = header.split(' ')[1];
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      include: { role: true, department: true },
    });

    if (!user || !user.isActive) {
      return next(new AppError('User account inactive or not found', 401));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      roleId: user.roleId,
      firstName: user.firstName,
      lastName: user.lastName,
      departmentId: user.departmentId,
      managerId: user.managerId,
      firebaseUid: user.firebaseUid,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Access token expired', 401));
    }
    next(new AppError('Invalid or expired token', 401));
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (roles.length && !roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
}

module.exports = { authenticate, authorize };
