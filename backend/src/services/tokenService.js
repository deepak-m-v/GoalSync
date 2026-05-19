const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const prisma = require('../lib/prisma');

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateOpaqueToken() {
  return crypto.randomBytes(48).toString('hex');
}

function signAccessToken(user) {
  return jwt.sign(
    {
      type: 'access',
      id: user.id,
      email: user.email,
      role: user.role?.name || user.role,
    },
    config.jwt.secret,
    { expiresIn: config.jwt.accessExpiresIn }
  );
}

function verifyAccessToken(token) {
  const payload = jwt.verify(token, config.jwt.secret);
  if (payload.type !== 'access') {
    const err = new Error('Invalid token type');
    err.statusCode = 401;
    throw err;
  }
  return payload;
}

function getRefreshExpiryDate() {
  const ms = parseExpiry(config.jwt.refreshExpiresIn);
  return new Date(Date.now() + ms);
}

function parseExpiry(str) {
  const match = /^(\d+)([smhd])$/.exec(str);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const n = parseInt(match[1], 10);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return n * unit;
}

async function createRefreshToken(userId) {
  const raw = generateOpaqueToken();
  const tokenHash = hashToken(raw);
  const expiresAt = getRefreshExpiryDate();

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return raw;
}

async function validateRefreshToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.refreshToken.findFirst({
    where: {
      tokenHash,
      revoked: false,
      expiresAt: { gt: new Date() },
    },
    include: { user: { include: { role: true, department: true } } },
  });
  return record;
}

async function revokeRefreshToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revoked: false },
    data: { revoked: true },
  });
}

async function revokeAllUserTokens(userId) {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

async function rotateRefreshToken(oldRaw, userId) {
  await revokeRefreshToken(oldRaw);
  return createRefreshToken(userId);
}

module.exports = {
  signAccessToken,
  verifyAccessToken,
  createRefreshToken,
  validateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  rotateRefreshToken,
  hashToken,
};
