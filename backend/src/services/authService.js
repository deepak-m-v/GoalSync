const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
const { logAudit } = require('./auditService');
const { verifyFirebaseIdToken, setUserRoleClaim } = require('../lib/firebase');
const {
  signAccessToken,
  createRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  rotateRefreshToken,
} = require('./tokenService');
const AppError = require('../utils/AppError');

function formatUser(user) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role?.name || user.role,
    departmentId: user.departmentId,
    departmentName: user.department?.name,
    managerId: user.managerId,
    firebaseUid: user.firebaseUid,
  };
}

async function issueSession(user, req) {
  const accessToken = signAccessToken(user);
  const refreshToken = await createRefreshToken(user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  await logAudit({
    userId: user.id,
    entityType: 'user',
    entityId: user.id,
    action: 'update',
    newValues: { event: 'login' },
    req,
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    user: formatUser(user),
  };
}

async function login(email, password, req) {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), isActive: true },
    include: { role: true, department: true },
  });

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError('Invalid email or password', 401);
  }

  return issueSession(user, req);
}

async function loginWithFirebase(idToken, req) {
  const decoded = await verifyFirebaseIdToken(idToken);
  const email = decoded.email?.toLowerCase();

  if (!email) throw new AppError('Firebase account has no email', 400);

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ firebaseUid: decoded.uid }, { email }],
    },
    include: { role: true, department: true },
  });

  if (!user) {
    throw new AppError(
      'No portal account for this Firebase user. Contact HR to provision access.',
      403
    );
  }

  if (!user.isActive) throw new AppError('User account is inactive', 403);

  if (!user.firebaseUid) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { firebaseUid: decoded.uid },
      include: { role: true, department: true },
    });
  }

  try {
    await setUserRoleClaim(decoded.uid, user.role.name);
  } catch {
    // Non-fatal if custom claims fail
  }

  return issueSession(user, req);
}

async function refreshSession(refreshToken, req) {
  if (!refreshToken) throw new AppError('Refresh token required', 400);

  const record = await validateRefreshToken(refreshToken);
  if (!record?.user?.isActive) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const newRefresh = await rotateRefreshToken(refreshToken, record.userId);
  const accessToken = signAccessToken(record.user);

  return {
    accessToken,
    refreshToken: newRefresh,
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    user: formatUser(record.user),
  };
}

async function logout(refreshToken, userId) {
  if (refreshToken) await revokeRefreshToken(refreshToken);
  if (userId) await revokeAllUserTokens(userId);
  return { message: 'Logged out successfully' };
}

async function getProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, department: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return formatUser(user);
}

async function hashPassword(plain) {
  return bcrypt.hash(plain, 12);
}

module.exports = {
  login,
  loginWithFirebase,
  refreshSession,
  logout,
  getProfile,
  issueSession,
  hashPassword,
  formatUser,
};
