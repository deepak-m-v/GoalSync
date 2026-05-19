require('dotenv').config();

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_change_me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'dev_refresh_secret',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  firebase: {
    enabled: Boolean(process.env.FIREBASE_PROJECT_ID),
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGIN),
  email: {
    enabled: process.env.EMAIL_ENABLED !== 'false',
    from: process.env.EMAIL_FROM || 'GoalSync AI <noreply@goalsync.local>',
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },
  escalation: {
    cronEnabled: process.env.ESCALATION_CRON_ENABLED !== 'false',
    cronSchedule: process.env.ESCALATION_CRON || '0 8 * * *',
    retryCronSchedule: process.env.ESCALATION_RETRY_CRON || '0 */2 * * *',
    engineSecret: process.env.ESCALATION_ENGINE_SECRET || process.env.CRON_SECRET,
    appUrl: process.env.APP_URL || 'http://localhost:5173',
  },
  azure: {
    enabled: Boolean(process.env.AZURE_CLIENT_ID && process.env.AZURE_TENANT_ID),
    tenantId: process.env.AZURE_TENANT_ID || 'common',
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    redirectUri: process.env.AZURE_REDIRECT_URI || 'http://localhost:5000/api/auth/microsoft/callback',
    scopes: process.env.AZURE_SCOPES || 'openid profile email offline_access User.Read GroupMember.Read.All',
    /** Map Entra group object IDs or display names → portal role */
    groupRoleMap: parseGroupRoleMap(process.env.AZURE_GROUP_ROLE_MAP),
    syncRoleOnLogin: process.env.AZURE_SYNC_ROLE_ON_LOGIN !== 'false',
  },
  teams: {
    enabled: Boolean(process.env.TEAMS_WEBHOOK_URL),
    webhookUrl: process.env.TEAMS_WEBHOOK_URL,
    /** Optional per-channel webhooks JSON: {"approvals":"url","escalations":"url"} */
    webhooks: parseTeamsWebhooks(process.env.TEAMS_WEBHOOKS_JSON),
  },
};

function parseCorsOrigins(raw) {
  if (!raw) return ['http://localhost:5173'];
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function parseGroupRoleMap(raw) {
  if (!raw) {
    return {
      'GoalSync-Admins': 'admin',
      'GoalSync-Managers': 'manager',
      'GoalSync-Employees': 'employee',
    };
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function parseTeamsWebhooks(raw) {
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}
