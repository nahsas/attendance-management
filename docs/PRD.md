# Product Requirements Document (PRD)

## Internship Management System

---

## 1. Introduction

### 1.1 Purpose
The Internship Management System is a mobile-first platform designed to monitor and manage student internship activities. It enables schools to track student attendance, daily activities, and reports while providing students with a seamless way to log their internship progress.

### 1.2 Scope
- Multi-tenant system supporting multiple schools
- Role-based access: Superadmin, School Admin, Teacher, Student
- Mobile app for students to log attendance and activities
- Web dashboard for school administrators and teachers
- Customizable attendance configurations (1 or 2 breaks)

### 1.3 Target Users
| Role | Description |
|------|-------------|
| Superadmin | System-wide administrator |
| School Admin | Manages school settings and users |
| Teacher | Monitors and reviews student progress |
| Student | Logs attendance, activities, and reports |

---

## 2. User Stories

### 2.1 Student

| ID | User Story |
|----|------------|
| S1 | As a student, I want to clock in/out with GPS location so my school knows where I am |
| S2 | As a student, I want to log my breaks (1 or 2 depending on workplace) so my hours are accurate |
| S3 | As a student, I want to add daily activities with photos so I can document my work |
| S4 | As a student, I want to submit daily/weekly/monthly reports for supervisor review |
| S5 | As a student, I want to view my attendance history and statistics |
| S6 | As a student, I want to edit draft reports before submission |

### 2.2 Teacher

| ID | User Story |
|----|------------|
| T1 | As a teacher, I want to view all students in my school with their placements |
| T2 | As a teacher, I want to see real-time attendance of students |
| T3 | As a teacher, I want to review and approve/reject student reports |
| T4 | As a teacher, I want to filter students by internship place |
| T5 | As a teacher, I want to export attendance reports |

### 2.3 School Admin

| ID | User Story |
|----|------------|
| A1 | As a school admin, I want to create and manage internship places |
| A2 | As a school admin, I want to configure break schedules per place |
| A3 | As a school admin, I want to add/remove teachers and students |
| A4 | As a school admin, I want to assign students to internship places |
| A5 | As a school admin, I want to view school-wide analytics |

### 2.4 Superadmin

| ID | User Story |
|----|------------|
| SA1 | As a superadmin, I want to create and manage schools |
| SA2 | As a superadmin, I want to view system-wide statistics |
| SA3 | As a superadmin, I want to manage system settings |

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization

| FR ID | Requirement | Priority |
|-------|-------------|----------|
| AUTH-01 | Users can register and login with email/password | Must |
| AUTH-02 | JWT-based authentication for API access | Must |
| AUTH-03 | Role-based access control (RBAC) for all endpoints | Must |
| AUTH-04 | Password reset functionality via email | Should |

### 3.2 School Management

| FR ID | Requirement | Priority |
|-------|-------------|----------|
| SCH-01 | Superadmin can create new schools | Must |
| SCH-02 | School admin can manage school profile | Must |
| SCH-03 | School can have multiple users (, teachersadmin, students) | Must |

### 3.3 Internship Place Management

| FR ID | Requirement | Priority |
|-------|-------------|----------|
| PLACE-01 | School admin can add internship places | Must |
| PLACE-02 | Each place has GPS coordinates for attendance validation | Must |
| PLACE-03 | Each place has customizable break configuration (1 or 2 breaks) | Must |
| PLACE-04 | Place shows list of currently assigned students | Should |

### 3.4 Student Placement

| FR ID | Requirement | Priority |
|-------|-------------|----------|
| PLACE-01 | Admin can assign student to internship place | Must |
| PLACE-02 | Placement has start and end dates | Must |
| PLACE-03 | Placement can be terminated early | Should |
| PLACE-04 | Student can view their current and past placements | Must |

### 3.5 Attendance System

| FR ID | Requirement | Priority |
|-------|-------------|----------|
| ATT-01 | Student can clock in with timestamp and GPS | Must |
| ATT-02 | Student can clock out with timestamp and GPS | Must |
| ATT-03 | System calculates actual hours worked | Must |
| ATT-04 | System validates location is near internship place | Must |
| ATT-05 | Support configurable breaks (1 or 2) | Must |
| ATT-06 | Student can log break start/end times | Must |
| ATT-07 | Teacher can mark student as absent/late/on_leave | Must |
| ATT-08 | View attendance history by date range | Must |

### 3.6 Activity Logging

| FR ID | Requirement | Priority |
|-------|-------------|----------|
| ACT-01 | Student can add daily activities | Must |
| ACT-02 | Activities can include multiple photos | Should |
| ACT-03 | Activities have title and description | Must |
| ACT-04 | Teacher can view all activities for their students | Must |
| ACT-05 | Activities are date-stamped | Must |

### 3.7 Reporting System

| FR ID | Requirement | Priority |
|-------|-------------|----------|
| REP-01 | Students can create daily/weekly/monthly reports | Must |
| REP-02 | Reports start as drafts | Must |
| REP-03 | Students can submit reports for review | Must |
| REP-04 | Teachers can review and approve/reject reports | Must |
| REP-05 | Teachers can add review notes | Should |
| REP-06 | Reports show submission history | Should |

### 3.8 Analytics & Reporting

| FR ID | Requirement | Priority |
|-------|-------------|----------|
| AN-01 | Dashboard shows today's attendance summary | Must |
| AN-02 | Dashboard shows student activity overview | Must |
| AN-03 | Export attendance data to CSV/PDF | Should |
| AN-04 | School-wide statistics and metrics | Should |

---

## 4. Non-Functional Requirements

### 4.1 Performance
- API response time < 500ms for 95th percentile
- Support 1000+ concurrent users
- Real-time attendance updates

### 4.2 Security
- All passwords hashed with bcrypt
- HTTPS only
- JWT tokens with expiration
- Rate limiting on authentication endpoints
- Input validation and sanitization

### 4.3 Usability
- Mobile-first design (React Native)
- Bottom navigation for primary actions
- Large touch targets (minimum 48px)
- High contrast for outdoor readability
- Haptic and visual feedback for actions

### 4.4 Reliability
- 99.9% uptime
- Automatic backup daily
- Error logging and monitoring

---

## 5. User Flows

### 5.1 Daily Attendance Flow

```
Student Opens App
       │
       ▼
┌─────────────────┐
│  Check Location │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Near?   │
    └────┬────┘
      Yes ▼ No
    ┌─────────┐    ┌─────────────┐
    │Clock In │    │ Show Error  │
    └────┬────┘    └─────────────┘
         │
         ▼
    ┌─────────┐
    │ Select  │◄──────┐
    │ Break   │       │
    │ Config  │       │
    └────┬────┘       │
         │            │
    ┌────┴────┐       │
    │ 1 or 2? │       │
    └────┬────┘       │
      1  ▼  2         │
    ┌───────┐  ┌────────────┐
    │ Log  │  │ Log Break1 │
    │ Work │  │ & Break2   │
    └────┬────┘  └─────┬──────┘
         │             │
         └──────┬──────┘
                ▼
         ┌──────────┐
         │ Clock Out│
         └────┬─────┘
              │
              ▼
         ┌──────────┐
         │ View     │
         │ Summary  │
         └──────────┘
```

### 5.2 Report Submission Flow

```
Student Creates Report
       │
       ▼
┌─────────────────┐
│  Select Type    │ (Daily/Weekly/Monthly)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Fill Content   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Save as Draft  │──────┐
└────────┬────────┘      │
         │               │
         ▼               │
┌─────────────────┐      │
│  Submit Report  │      │
└────────┬────────┘      │
         │               │
         ▼               ▼
┌─────────────────┐  ┌─────────────┐
│ Teacher Reviews  │  │ Edit Draft  │
└────────┬────────┘  └─────────────┘
         │
    ┌────┴────┐
    │ Approve?│
    └────┬────┘
      Yes ▼ No
    ┌─────────┐    ┌─────────────┐
    │Approved │    │ Return for  │
    │         │    │ Revision    │
    └─────────┘    └─────────────┘
```

---

## 6. Screen Overview (Mobile)

### 6.1 Student Screens
| Screen | Description |
|--------|-------------|
| Login | Email/password authentication |
| Home | Quick actions, today's status |
| Attendance | Clock in/out, view history |
| Activities | Add/view daily activities |
| Reports | Create and manage reports |
| Profile | User settings, logout |

### 6.2 Teacher/Admin Screens
| Screen | Description |
|--------|-------------|
| Login | Authentication |
| Dashboard | Overview, today's stats |
| Students | List, filter, search |
| Attendance | Live attendance, history |
| Reports | Review queue, approve/reject |
| Places | Manage internship locations |
| Settings | School and user management |

---

## 7. Business Rules

| ID | Rule |
|----|------|
| BR-01 | Student can only clock in within 500m of assigned internship place |
| BR-02 | Maximum 1 clock in per day per student placement |
| BR-03 | Break configuration is mandatory for each internship place |
| BR-04 | Report must be submitted within 7 days of report period end |
| BR-05 | Teacher can only review reports from their school |
| BR-06 | Student cannot edit report after submission |
| BR-07 | School admin can only manage users within their school |
| BR-08 | Superadmin has access to all schools |

---

## 8. Success Metrics

| Metric | Target |
|--------|--------|
| Daily active users | 80% of enrolled students |
| Attendance completion rate | >95% |
| Report submission rate | >90% |
| API uptime | 99.9% |
| Average response time | <500ms |

---

## 9. Out of Scope

- Payment/billing system
- Parent portal
- Certificate generation
- Chat/messaging between users
- Push notifications (future enhancement)
- Offline mode (future enhancement)
