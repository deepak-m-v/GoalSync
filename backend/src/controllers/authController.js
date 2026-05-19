const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');
const config = require('../config');

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password, req);
  res.json({ success: true, data: result });
});

const firebaseLogin = asyncHandler(async (req, res) => {
  if (!config.firebase.enabled) {
    return res.status(503).json({
      success: false,
      message: 'Firebase auth is not enabled on the server. Use email/password login.',
    });
  }
  const result = await authService.loginWithFirebase(req.body.idToken, req);
  res.json({ success: true, data: result });
});

const refresh = asyncHandler(async (req, res) => {
  const result = await authService.refreshSession(req.body.refreshToken, req);
  res.json({ success: true, data: result });
});

const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.body.refreshToken, req.user?.id);
  res.json({ success: true, data: result });
});

const logoutAll = asyncHandler(async (req, res) => {
  const result = await authService.logout(null, req.user.id);
  res.json({ success: true, data: result });
});

const me = asyncHandler(async (req, res) => {
  const profile = await authService.getProfile(req.user.id);
  res.json({ success: true, data: profile });
});

const authStatus = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      firebaseEnabled: config.firebase.enabled,
      microsoftEnabled: config.azure.enabled,
      teamsEnabled: config.teams.enabled,
      accessTokenTtl: config.jwt.accessExpiresIn,
      refreshTokenTtl: config.jwt.refreshExpiresIn,
    },
  });
});

module.exports = { login, firebaseLogin, refresh, logout, logoutAll, me, authStatus };
