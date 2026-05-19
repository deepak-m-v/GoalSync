const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config');
const AppError = require('../utils/AppError');

function getAuthority() {
  return `https://login.microsoftonline.com/${config.azure.tenantId}/oauth2/v2.0`;
}

function createPkcePair() {
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  return { codeVerifier, codeChallenge };
}

function signOAuthState(codeVerifier) {
  return jwt.sign({ cv: codeVerifier, purpose: 'microsoft_sso' }, config.jwt.secret, {
    expiresIn: '10m',
  });
}

function verifyOAuthState(state) {
  try {
    const payload = jwt.verify(state, config.jwt.secret);
    if (payload.purpose !== 'microsoft_sso' || !payload.cv) {
      throw new Error('Invalid state');
    }
    return payload.cv;
  } catch {
    throw new AppError('Invalid or expired OAuth state', 400);
  }
}

function getAuthorizationUrl() {
  if (!config.azure.enabled) {
    throw new AppError('Microsoft Entra ID is not configured', 503);
  }

  const { codeVerifier, codeChallenge } = createPkcePair();
  const state = signOAuthState(codeVerifier);

  const params = new URLSearchParams({
    client_id: config.azure.clientId,
    response_type: 'code',
    redirect_uri: config.azure.redirectUri,
    response_mode: 'query',
    scope: config.azure.scopes,
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  });

  return {
    url: `${getAuthority()}/authorize?${params.toString()}`,
    state,
  };
}

async function exchangeCodeForTokens(code, codeVerifier) {
  const body = new URLSearchParams({
    client_id: config.azure.clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.azure.redirectUri,
    code_verifier: codeVerifier,
  });

  if (config.azure.clientSecret) {
    body.append('client_secret', config.azure.clientSecret);
  }

  const res = await fetch(`${getAuthority()}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new AppError(data.error_description || data.error || 'Token exchange failed', 401);
  }
  return data;
}

async function graphGet(path, accessToken) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await res.json();
  if (!res.ok) {
    throw new AppError(data.error?.message || 'Microsoft Graph request failed', 502);
  }
  return data;
}

async function fetchUserProfile(accessToken) {
  return graphGet('/me?$select=id,displayName,givenName,surname,mail,userPrincipalName,jobTitle', accessToken);
}

async function fetchUserGroups(accessToken) {
  const data = await graphGet('/me/memberOf?$select=id,displayName', accessToken);
  return (data.value || []).filter((g) => g['@odata.type']?.includes('group'));
}

module.exports = {
  getAuthorizationUrl,
  verifyOAuthState,
  exchangeCodeForTokens,
  fetchUserProfile,
  fetchUserGroups,
};
