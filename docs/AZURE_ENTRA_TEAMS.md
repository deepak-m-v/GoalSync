# Microsoft Entra ID & Teams Integration — GoalSync AI

## Overview

- **Single Sign-On (SSO)** via OAuth 2.0 authorization code flow with PKCE
- **Role mapping** from Entra ID security groups to portal roles (`admin`, `manager`, `employee`)
- **Teams adaptive cards** via Incoming Webhook for manager approval alerts
- **Deep links** into the React app (`/manager/approvals?approvalId=`)

---

## 1. Azure App Registration

1. Open [Microsoft Entra admin center](https://entra.microsoft.com) → **App registrations** → **New registration**
2. Name: `GoalSync AI Portal`
3. Supported account types: single tenant (or multitenant per org policy)
4. Redirect URI (Web): `http://localhost:5000/api/auth/microsoft/callback` (production: your API URL)

### API permissions (Microsoft Graph — delegated)

| Permission | Purpose |
|------------|---------|
| `openid`, `profile`, `email` | Sign-in |
| `User.Read` | Profile |
| `GroupMember.Read.All` | Read group membership for role mapping |
| `offline_access` | Refresh tokens (optional) |

Grant **admin consent** for the tenant.

### Authentication

- Enable **ID tokens** (optional)
- For confidential client: create a **client secret** under Certificates & secrets
- For public SPA + PKCE-only backend: client secret optional if using PKCE without secret (mobile/public); for web app registration with secret, set `AZURE_CLIENT_SECRET`

### App roles (optional)

You may define app roles in the manifest; this integration uses **security groups** mapped via `AZURE_GROUP_ROLE_MAP`.

---

## 2. Entra ID security groups

Create groups and add users:

| Group display name | Portal role |
|--------------------|-------------|
| `GoalSync-Admins` | `admin` |
| `GoalSync-Managers` | `manager` |
| `GoalSync-Employees` | `employee` |

Copy each group's **Object ID** if you prefer ID-based mapping in env JSON.

---

## 3. Environment variables

```env
# Entra ID
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-application-client-id
AZURE_CLIENT_SECRET=your-client-secret
AZURE_REDIRECT_URI=http://localhost:5000/api/auth/microsoft/callback
AZURE_SCOPES=openid profile email offline_access User.Read GroupMember.Read.All
AZURE_GROUP_ROLE_MAP={"GoalSync-Admins":"admin","GoalSync-Managers":"manager","GoalSync-Employees":"employee"}
AZURE_SYNC_ROLE_ON_LOGIN=true

# App URLs (deep links)
APP_URL=http://localhost:5173
CORS_ORIGIN=http://localhost:5173

# Teams Incoming Webhook (channel → Connectors → Incoming Webhook)
TEAMS_WEBHOOK_URL=https://outlook.office.com/webhook/...
# Optional per-channel JSON
TEAMS_WEBHOOKS_JSON={"approvals":"https://outlook.office.com/webhook/..."}
```

---

## 4. OAuth flow

```
User → GET /api/auth/microsoft/login
     → Redirect to login.microsoftonline.com (PKCE + state)
     → User signs in
     → GET /api/auth/microsoft/callback?code=&state=
     → Exchange code, call Graph /me + /me/memberOf
     → Map groups → role, link azure_oid, issue JWT
     → Redirect to {APP_URL}/auth/microsoft/callback?accessToken=&refreshToken=
     → Frontend stores session → /dashboard
```

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/auth/microsoft/config` | Whether SSO is enabled |
| GET | `/api/auth/microsoft/login` | Start SSO redirect |
| GET | `/api/auth/microsoft/callback` | OAuth callback (server) |
| GET | `/api/teams/status` | Teams webhook status |
| POST | `/api/teams/test` | Send sample card (admin) |
| POST | `/api/teams/cards/approval-pending` | Send sample approval card (admin) |

---

## 5. Role mapping logic

On each Microsoft login:

1. Fetch `memberOf` groups from Graph
2. Match group **id** or **displayName** against `AZURE_GROUP_ROLE_MAP`
3. Highest priority wins: `admin` > `manager` > `employee`
4. If `AZURE_SYNC_ROLE_ON_LOGIN=true`, update `users.role_id` in PostgreSQL
5. Store `azure_oid` on the user record

Users must already exist in the portal (email match) unless you extend provisioning.

---

## 6. Teams webhook & adaptive cards

When an employee **submits goals**, the API:

1. Creates in-app notification for the manager
2. Posts an adaptive card to `TEAMS_WEBHOOK_URL` (or `TEAMS_WEBHOOKS_JSON.approvals`)

Sample card JSON: `backend/src/teams/samples/managerApprovalPending.card.json`

Card includes **Open URL** actions:

- Review: `{APP_URL}/manager/approvals?approvalId={id}`
- Dashboard: `{APP_URL}/dashboard`

### Test from CLI

```bash
curl -X POST http://localhost:5000/api/teams/test \
  -H "Authorization: Bearer {admin_jwt}"
```

---

## 7. Database

```bash
psql $DATABASE_URL -f database/migrations/003_azure_oid.sql
cd backend && npx prisma db push
```

Adds `users.azure_oid` (unique) for Entra object ID linkage.

---

## 8. Production checklist

- [ ] HTTPS redirect URIs in Entra and `AZURE_REDIRECT_URI`
- [ ] Restrict CORS to production frontend origin
- [ ] Rotate client secrets; use Key Vault / Render secrets
- [ ] Use dedicated Teams channel webhooks per notification type
- [ ] Validate group membership server-side on every login
- [ ] Consider Microsoft Teams Bot (Bot Framework) for 1:1 manager DMs instead of channel webhooks
