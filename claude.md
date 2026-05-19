# GoalSync AI — Enterprise Goal Setting & Tracking Portal

## Project Overview

Build a modern enterprise-grade web application called **GoalSync AI**.

The platform is an internal organizational portal for:
- Goal creation
- Goal approval
- Quarterly performance tracking
- Team alignment
- Analytics
- HR governance

The system must support Employees, Managers, and Admin/HR roles.

---

# Tech Stack

## Frontend
- React.js
- Tailwind CSS
- Framer Motion
- React Router
- Axios
- Recharts

## Backend
- Node.js
- Express.js
- JWT Authentication
- REST APIs

## Database
- PostgreSQL

## Hosting
- Frontend → Vercel
- Backend → Render
- Database → Neon PostgreSQL

---

# Core Modules

## 1. Authentication & Authorization

### Features
- JWT Login
- Role-based access
- Protected routes
- Session persistence
- Password hashing
- Employee / Manager / Admin roles

---

# 2. Employee Goal Management

## Employee Dashboard
Employees can:
- Create goals
- Edit goals before submission
- Submit goal sheet
- View quarterly progress
- Update achievements
- View manager comments

## Goal Fields
Each goal must contain:
- Goal Title
- Goal Description
- Thrust Area
- Unit of Measurement (UoM)
- Target
- Weightage
- Timeline
- Status

## Supported UoM Types
- Numeric
- Percentage
- Timeline
- Zero-based

---

# 3. Goal Validation Rules

Enforce these validations:

- Total weightage across all goals = 100%
- Minimum weightage per goal = 10%
- Maximum goals per employee = 8

Show proper validation messages.

---

# 4. Manager Approval Workflow

Managers can:
- Review submitted goals
- Approve goals
- Reject goals
- Edit targets inline
- Edit weightages inline
- Add review comments

After approval:
- Goals become locked
- Only Admin can unlock

---

# 5. Shared Goals Module

Managers/Admin can assign shared KPIs to multiple employees.

Rules:
- Employees can edit only weightage
- Goal title and target remain read-only
- Achievement updates sync automatically

---

# 6. Quarterly Check-ins

Employees update achievements quarterly.

Quarters:
- Q1
- Q2
- Q3
- Q4

Features:
- Planned vs Actual tracking
- Status updates
- Progress tracking

Status Options:
- Not Started
- On Track
- Completed

---

# 7. Progress Score Engine

## Formula Rules

### Min Type
Formula:
Achievement / Target

### Max Type
Formula:
Target / Achievement

### Timeline
Compare deadline vs completion date.

### Zero-Based
If value = 0:
100%

Else:
0%

---

# 8. Manager Check-in Module

Managers can:
- View employee quarterly progress
- Compare planned vs actual
- Add structured comments
- Save check-in logs

---

# 9. Admin Panel

Admin capabilities:
- Manage users
- Manage hierarchy
- Unlock goals
- Configure cycles
- View analytics
- View audit logs
- Manage escalations

---

# 10. Reporting Module

Required reports:
- Planned vs Actual report
- Employee completion report
- Department analytics
- Quarterly summaries

Export support:
- CSV
- Excel

---

# 11. Analytics Dashboard

Build modern analytics dashboards with:
- KPI cards
- Progress charts
- Heatmaps
- QoQ trends
- Department performance
- Goal distribution
- Manager effectiveness

Use Recharts.

---

# 12. Escalation Engine

Rules:
- Goal not submitted
- Approval pending
- Check-in overdue

Escalation flow:
Employee → Manager → HR

Features:
- Scheduled jobs
- Email notifications
- Escalation logs

---

# 13. Audit Logging

Track:
- Goal edits
- Approval actions
- Unlock actions
- Achievement updates

Store:
- Who changed
- What changed
- Timestamp

---

# 14. UI/UX Requirements

Design style:
- Modern enterprise HRMS
- Microsoft/Atlassian inspired
- Clean dashboards
- Glassmorphism cards
- Smooth animations

Requirements:
- Fully responsive
- Dark/light mode
- Sidebar layout
- Professional typography
- Reusable components
- Loading skeletons
- Toast notifications

---

# 15. Required Pages

## Public
- Login
- Forgot Password

## Employee
- Dashboard
- Goal Creation
- Quarterly Updates
- Goal History

## Manager
- Team Dashboard
- Goal Approval
- Check-in Review

## Admin
- Admin Dashboard
- User Management
- Analytics
- Audit Logs
- Escalation Management

---

# 16. Database Requirements

Tables:
- Users
- Roles
- Departments
- Goals
- Goal Approvals
- Shared Goals
- Check-ins
- Achievement Logs
- Audit Logs
- Notifications
- Escalations

Use proper:
- Foreign keys
- Indexing
- Relationships
- Constraints

---

# 17. Backend Architecture

Use:
- MVC architecture
- Middleware
- REST APIs
- Validation layer
- Error handling
- Service layer

---

# 18. Folder Structure

Generate scalable enterprise folder structures for:
- frontend
- backend
- shared components
- APIs
- services
- database

---

# 19. Deployment

Generate production-ready deployment configs for:
- Vercel
- Render
- PostgreSQL

Include:
- Docker support
- Environment variables
- Build scripts

---

# 20. Code Quality

Requirements:
- Clean architecture
- Reusable components
- Type-safe patterns
- Proper comments
- Modular code
- Scalable structure

Avoid:
- Hardcoded values
- Repeated code
- Unoptimized rendering
- Poor folder organization

---

# Final Goal

Generate a complete hackathon-winning enterprise web application with:
- production-quality UI
- scalable backend
- analytics dashboards
- authentication
- role management
- reporting
- enterprise workflows
- responsive design
- clean architecture