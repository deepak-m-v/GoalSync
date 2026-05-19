# GoalSync AI - Hackathon Submission

## 1. Live Demo URLs
* **Frontend Portal:** [Insert Vercel URL here]
* **Backend API:** [Insert Render URL here]

## 2. Source Code Repository
**GitHub:** https://github.com/deepak-m-v/GoalSync.git

## 3. Architecture Diagram
Please see the attached `ARCHITECTURE.pdf` (generated from the provided Mermaid diagram).

## 4. Role-Based Login Credentials
The platform supports three distinct enterprise roles. You can seamlessly switch between these user journeys by logging out and logging back in using the credentials below:

### Admin / HR Role
* **Email:** `admin@goalsync.com`
* **Password:** `Password123`
* **Features:** User management, system-wide analytics, audit logs, and configuring performance cycles.

### Manager Role
* **Email:** `manager@goalsync.com`
* **Password:** `Password123`
* **Features:** Team dashboard, goal approval workflows (approve/reject/comment), and quarterly check-in reviews for reports.

### Employee Role
* **Email:** `employee@goalsync.com`
* **Password:** `Password123`
* **Features:** OKR-style goal creation (with 100% weightage validation constraints) and quarterly progress/achievement tracking.

---
*Note: Authentication is powered by Firebase, and authorization/role management is handled securely via our Node.js/PostgreSQL backend.*
