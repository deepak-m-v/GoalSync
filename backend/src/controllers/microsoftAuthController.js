const azureAuthService = require('../services/azureAuthService');
const asyncHandler = require('../utils/asyncHandler');

const login = asyncHandler(async (req, res) => {
  const { url } = azureAuthService.getLoginRedirect();
  res.redirect(url);
});

const callback = asyncHandler(async (req, res) => {
  try {
    const session = await azureAuthService.handleCallback(
      { code: req.query.code, state: req.query.state },
      req
    );
    res.redirect(azureAuthService.buildFrontendCallbackUrl(session));
  } catch (err) {
    res.redirect(azureAuthService.buildFrontendCallbackUrl(null, err.message));
  }
});

const getConfig = asyncHandler(async (req, res) => {
  const appConfig = require('../config');
  res.json({
    success: true,
    data: {
      enabled: appConfig.azure.enabled,
      loginUrl: appConfig.azure.enabled ? '/api/auth/microsoft/login' : null,
    },
  });
});

module.exports = { login, callback, getConfig };
