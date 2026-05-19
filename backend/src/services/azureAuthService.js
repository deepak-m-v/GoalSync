const prisma = require('../lib/prisma');
const config = require('../config');
const {
  getAuthorizationUrl,
  verifyOAuthState,
  exchangeCodeForTokens,
  fetchUserProfile,
  fetchUserGroups,
} = require('../lib/azureOAuth');
const { issueSession, formatUser } = require('./authService');
const AppError = require('../utils/AppError');

const ROLE_PRIORITY = { admin: 3, manager: 2, employee: 1 };

function mapGroupsToRole(groups) {
  const map = config.azure.groupRoleMap || {};
  let bestRole = null;
  let bestScore = 0;

  for (const group of groups) {
    const keys = [group.id, group.displayName].filter(Boolean);
    for (const key of keys) {
      const role = map[key];
      if (role && (ROLE_PRIORITY[role] || 0) > bestScore) {
        bestScore = ROLE_PRIORITY[role];
        bestRole = role;
      }
    }
  }

  return bestRole;
}

async function resolvePortalUser(profile, groups) {
  const email = (profile.mail || profile.userPrincipalName || '').toLowerCase();
  if (!email) throw new AppError('Microsoft account has no email', 400);

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ azureOid: profile.id }, { email }],
    },
    include: { role: true, department: true },
  });

  if (!user) {
    throw new AppError(
      'No GoalSync account linked to this Microsoft identity. Contact HR to provision access.',
      403
    );
  }

  if (!user.isActive) throw new AppError('User account is inactive', 403);

  const mappedRole = mapGroupsToRole(groups);
  const updates = { azureOid: profile.id };

  if (mappedRole && config.azure.syncRoleOnLogin) {
    const role = await prisma.role.findUnique({ where: { name: mappedRole } });
    if (role && role.id !== user.roleId) {
      updates.roleId = role.id;
    }
  }

  if (!user.firstName && profile.givenName) updates.firstName = profile.givenName;
  if (!user.lastName && profile.surname) updates.lastName = profile.surname;

  if (Object.keys(updates).length > 0) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: updates,
      include: { role: true, department: true },
    });
  }

  return { user, mappedRole };
}

function getLoginRedirect() {
  return getAuthorizationUrl();
}

async function handleCallback({ code, state }, req) {
  if (!code) throw new AppError('Authorization code missing', 400);

  const codeVerifier = verifyOAuthState(state);
  const tokens = await exchangeCodeForTokens(code, codeVerifier);
  const profile = await fetchUserProfile(tokens.access_token);
  const groups = await fetchUserGroups(tokens.access_token);
  const { user, mappedRole } = await resolvePortalUser(profile, groups);
  const session = await issueSession(user, req);

  return {
    ...session,
    microsoft: {
      oid: profile.id,
      groups: groups.map((g) => ({ id: g.id, name: g.displayName })),
      mappedRole,
    },
  };
}

function buildFrontendCallbackUrl(session, error) {
  const frontend = (config.corsOrigin || 'http://localhost:5173').replace(/\/$/, '');
  if (error) {
    return `${frontend}/auth/microsoft/callback?error=${encodeURIComponent(error)}`;
  }
  const params = new URLSearchParams({
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    expiresIn: session.expiresIn,
  });
  return `${frontend}/auth/microsoft/callback?${params.toString()}`;
}

module.exports = {
  getLoginRedirect,
  handleCallback,
  buildFrontendCallbackUrl,
  mapGroupsToRole,
  formatUser,
};
