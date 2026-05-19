# GoalSync AI — REST API Documentation (v2)

Base URL: `http://localhost:5000/api`

## Authentication

Enterprise auth uses **short-lived JWT access tokens** + **rotating refresh tokens** (stored hashed in PostgreSQL). Optional **Firebase Authentication** for sign-in.

All protected routes require:

```
Authorization: Bearer <access_token>
```

### GET `/auth/status`

Returns `firebaseEnabled`, token TTLs.

### POST `/auth/login` (bcrypt — always available)

```json
{ "email": "employee@goalsync.com", "password": "Password123" }
```

**Response**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "opaque_hex...",
    "expiresIn": "15m",
    "user": { "id": 3, "role": "employee", ... }
  }
}
```

### POST `/auth/firebase` (when Firebase Admin is configured)

```json
{ "idToken": "<firebase_id_token>" }
```

Verifies token with Firebase Admin, links `firebase_uid`, issues access + refresh tokens. Sets Firebase custom claim `role`.

### POST `/auth/refresh`

```json
{ "refreshToken": "..." }
```

Rotates refresh token; returns new `accessToken` + `refreshToken`.

### POST `/auth/logout`

```json
{ "refreshToken": "..." }
```

Revokes refresh token.

### POST `/auth/logout-all` (authenticated)

Revokes all refresh tokens for the user.

### GET `/auth/me`

Returns current user profile (requires valid access token).

### Roles

| Role | Access |
|------|--------|
| `employee` | Own goals, check-ins |
| `manager` | Team + approvals |
| `admin` | Full org + audit |

---

## 1. Goals

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/goals/cycle/active` | Any | Active performance cycle |
| GET | `/goals?userId=&cycleId=` | Any* | List goals (*manager/admin for other users) |
| POST | `/goals` | Employee+ | Create draft goal |
| PUT | `/goals/:id` | Owner | Update draft goal |
| DELETE | `/goals/:id` | Owner | Delete draft goal |
| POST | `/goals/submit` | Employee | Submit sheet (validates 100% weight) |
| POST | `/goals/:id/unlock` | Admin | Unlock approved goal |

**Create body sample**

```json
{
  "cycleId": 1,
  "title": "Increase NPS to 85",
  "description": "Customer satisfaction target",
  "thrustArea": "Customer Excellence",
  "uomType": "numeric",
  "target": 85,
  "weightage": 25,
  "timeline": "2026-12-31"
}
```

---

## 2. Goal Approvals

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/approvals` | Manager | Pending approvals for team |
| GET | `/approvals/:id` | Manager | Approval + employee goals |
| POST | `/approvals/:id/review` | Manager | Approve/reject sheet |
| PATCH | `/approvals/goals/:goalId` | Manager | Inline edit target/weightage |

**Review body**

```json
{ "status": "approved", "comments": "Well aligned with team OKRs" }
```

**Legacy:** `GET /manager/approvals`, `POST /manager/approvals/:id/review`

---

## 3. Shared Goals

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/shared-goals?cycleId=` | Any | List KPI templates |
| POST | `/shared-goals` | Manager/Admin | Create template |
| POST | `/shared-goals/:id/assign` | Manager/Admin | Assign to employees |
| PATCH | `/shared-goals/assignments/:assignmentId/weightage` | Employee | Update weight only |

**Assign body**

```json
{
  "assignments": [
    { "userId": 3, "weightage": 20 },
    { "userId": 4, "weightage": 20 }
  ]
}
```

---

## 4. Quarterly Check-ins

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/check-ins?userId=&cycleId=&quarter=` | Any* | List check-ins |
| PUT | `/check-ins/goals/:goalId` | Employee | Upsert Q1–Q4 check-in |
| POST | `/check-ins/:id/manager-comment` | Manager | Add review comment |

**Upsert body**

```json
{
  "quarter": "Q2",
  "plannedValue": 50,
  "actualValue": 45,
  "progressStatus": "on_track",
  "employeeNotes": "On track for Q2 close"
}
```

---

## 5. Analytics

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/analytics/dashboard?cycleId=&departmentId=` | Manager/Admin | KPI dashboard |
| GET | `/analytics/qoq?cycleId=` | Manager/Admin | Quarter-over-quarter trends |
| GET | `/analytics/managers` | Admin | Manager effectiveness |

**Legacy:** `GET /admin/analytics`

---

## 6. Reports

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/reports/planned-vs-actual?format=csv` | Manager/Admin | Planned vs actual export |
| GET | `/reports/employee-completion?format=csv` | Manager/Admin | Completion by employee |
| GET | `/reports/quarterly-summary?format=csv` | Manager/Admin | Quarterly aggregates |

Add `?format=csv` for file download; omit for JSON rows.

---

## 7. Notifications

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/notifications?unread=true` | Any | List notifications |
| PATCH | `/notifications/:id/read` | Any | Mark one read |
| PATCH | `/notifications/read-all` | Any | Mark all read |

---

## 8. Escalations

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/escalations?status=open` | Manager/Admin | List escalations |
| POST | `/escalations/:id/resolve` | Admin | Resolve escalation |
| POST | `/escalations/engine/run` | Admin | Run escalation rules job |

**Legacy:** `GET /admin/escalations`

Escalation engine creates records for:
- Employees with no goals in active cycle
- Approvals pending > 7 days

---

## 9. Audit Logs

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/audit-logs?entityType=&entityId=&userId=` | Admin | Query audit trail |

**Legacy:** `GET /admin/audit-logs`

---

## 10. Team & Users

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/team` | Manager | Direct reports + goal stats |
| GET | `/users` | Admin | All users |

**Legacy:** `GET /manager/team`, `GET /admin/users`

---

## Error format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{ "field": "weightage", "message": "..." }]
}
```

| Code | Meaning |
|------|---------|
| 400 | Validation / business rule |
| 401 | Missing or invalid JWT |
| 403 | Role or ownership denied |
| 404 | Resource not found |
| 409 | Unique constraint (Prisma P2002) |
| 500 | Server error |

---

## Folder structure

```
backend/
├── prisma/
│   ├── schema.prisma      # Prisma models (maps to PostgreSQL)
│   └── seed.js
├── src/
│   ├── app.js             # Express app
│   ├── server.js          # HTTP server + graceful shutdown
│   ├── config/
│   ├── lib/prisma.js      # Prisma client singleton
│   ├── middleware/        # auth, validate, errorHandler
│   ├── routes/            # Route modules (10 + legacy)
│   ├── controllers/       # HTTP layer
│   ├── services/          # Business logic
│   ├── validators/        # express-validator rules
│   └── utils/             # AppError, asyncHandler, progressScore
└── API.md
```

---

## Setup

```bash
cd backend
npm install
# Apply database/schema.sql first, then:
npx prisma generate
npm run db:seed
npm run dev
```

Demo accounts: `admin@goalsync.com` | `manager@goalsync.com` | `employee@goalsync.com` — password `Password123`
