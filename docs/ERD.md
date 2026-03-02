# Entity Relationship Diagram (ERD)

## Internship Management System

---

## 1. Entity Overview

### Core Entities

| Entity | Description |
|--------|-------------|
| User | Authentication and user management (Superadmin, School Admin, Teacher, Student) |
| School | Multi-tenant organization unit |
| InternshipPlace | Company/location where students do their internship |
| StudentPlacement | Assignment of students to internship places |
| AttendanceSession | Daily attendance session with configurable breaks |
| AttendanceLog | Clock in/out records with location data |
| BreakLog | Break time records |
| ActivityLog | Student daily activity entries |
| Report | Student reports (weekly/monthly) |
| BreakConfig | Custom break configuration per internship place |

---

## 2. Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 USER                                         │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ superadmin │  │ school_admin│  │   teacher   │  │   student   │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
└────────────────────────────────┬────────────────────────────────────────────┘
                                 │ 1:N (belongs to)
                                 ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                                  SCHOOL                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id, name, address, phone, email, logo, is_active, created_at      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │ 1:N
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNSHIP_PLACE                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id, school_id, name, address, phone, email, latitude, longitude,    │   │
│  │ contact_person, contact_phone, industry, is_active                  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          │                                                 │
│                          │ 1:N                                             │
│                          ▼                                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         BREAK_CONFIG                                │   │
│  │ id, internship_place_id, break_count (1 or 2), break1_start,        │   │
│  │ break1_end, break2_start, break2_end, total_break_minutes           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │ 1:N
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           STUDENT_PLACEMENT                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id, student_id, internship_place_id, start_date, end_date,          │   │
│  │ status (active/completed/terminated), supervisor_name,              │   │
│  │ supervisor_phone, created_at                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────────────────────────┘
                          │ 1:N
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ATTENDANCE_SESSION                                 │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id, student_placement_id, date, status (present/absent/late/        │   │
│  │ on_leave), required_hours, actual_hours, notes, created_at         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                          │                                                 │
│                          │ 1:N                                             │
│                          ▼                                                 │
│  ┌──────────────────┐    ┌──────────────────┐                              │
│  │  ATTENDANCE_LOG  │    │    BREAK_LOG     │                              │
│  │  ┌────────────┐  │    │  ┌────────────┐  │                              │
│  │  │ id         │  │    │  │ id         │  │                              │
│  │  │ session_id │  │    │  │ session_id │  │                              │
│  │  │ type      │◄─┼────┤  │ break_num  │  │                              │
│  │  │ timestamp │  │    │  │ start_time │  │                              │
│  │  │ latitude  │  │    │  │ end_time   │  │                              │
│  │  │ longitude │  │    │  │ duration   │  │                              │
│  │  │ location  │  │    │  └────────────┘  │                              │
│  │  │ photo     │  │    │                   │                              │
│  │  └────────────┘  │    └──────────────────┘                              │
│  └──────────────────┘                                                     │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             ACTIVITY_LOG                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id, student_placement_id, date, title, description, photos,        │   │
│  │ created_at, updated_at                                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                                REPORT                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ id, student_placement_id, title, content, report_type             │   │
│  │ (daily/weekly/monthly), start_date, end_date, status                │   │
│  │ (draft/submitted/reviewed/approved), reviewed_by, reviewed_at,      │   │
│  │ review_notes, created_at, updated_at                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Relationship Summary

| Parent Entity | Child Entity | Relationship | Description |
|--------------|--------------|--------------|-------------|
| School | User | 1:N | School admin and teachers belong to a school |
| School | InternshipPlace | 1:N | Each school has multiple internship places |
| School | StudentPlacement | 1:N | Students assigned to placements within school |
| InternshipPlace | BreakConfig | 1:1 | Each place has one break configuration |
| InternshipPlace | StudentPlacement | 1:N | Multiple students at same place |
| StudentPlacement | AttendanceSession | 1:N | Daily attendance per placement |
| StudentPlacement | ActivityLog | 1:N | Daily activities per placement |
| StudentPlacement | Report | 1:N | Reports per placement |
| AttendanceSession | AttendanceLog | 1:N | Multiple clock in/out logs |
| AttendanceSession | BreakLog | 1:N | Multiple break logs (1 or 2) |
| User (Teacher) | Report | 1:N | Teacher reviews reports |

---

## 4. Key Business Rules

1. **Multi-tenant**: Each School is isolated - users can only see data within their school
2. **Break Configuration**: Internship places can have 1 or 2 breaks per day
3. **Attendance Tracking**: Each session requires clock-in and clock-out with GPS location
4. **Student-Place Assignment**: One student can have multiple placements over time
5. **Report Workflow**: Draft -> Submitted -> Reviewed -> Approved

---

## 5. Entity Attributes Detail

### User
- `id`: UUID (PK)
- `email`: String (unique)
- `password`: String (hashed)
- `first_name`: String
- `last_name`: String
- `role`: Enum (superadmin, school_admin, teacher, student)
- `school_id`: UUID (FK, nullable)
- `phone`: String
- `avatar`: String (URL)
- `is_active`: Boolean
- `created_at`: DateTime
- `updated_at`: DateTime

### School
- `id`: UUID (PK)
- `name`: String
- `address`: Text
- `phone`: String
- `email`: String
- `logo`: String (URL)
- `is_active`: Boolean
- `created_at`: DateTime
- `updated_at`: DateTime

### InternshipPlace
- `id`: UUID (PK)
- `school_id`: UUID (FK)
- `name`: String
- `address`: Text
- `phone`: String
- `email`: String
- `latitude`: Decimal
- `longitude`: Decimal
- `contact_person`: String
- `contact_phone`: String
- `industry`: String
- `is_active`: Boolean
- `created_at`: DateTime
- `updated_at`: DateTime

### BreakConfig
- `id`: UUID (PK)
- `internship_place_id`: UUID (FK)
- `break_count`: Integer (1 or 2)
- `break1_start`: Time
- `break1_end`: Time
- `break2_start`: Time (nullable)
- `break2_end`: Time (nullable)
- `total_break_minutes`: Integer

### StudentPlacement
- `id`: UUID (PK)
- `student_id`: UUID (FK to User)
- `internship_place_id`: UUID (FK)
- `start_date`: Date
- `end_date`: Date
- `status`: Enum (active, completed, terminated)
- `supervisor_name`: String
- `supervisor_phone`: String
- `created_at`: DateTime
- `updated_at`: DateTime

### AttendanceSession
- `id`: UUID (PK)
- `student_placement_id`: UUID (FK)
- `date`: Date
- `status`: Enum (present, absent, late, on_leave)
- `required_hours`: Decimal
- `actual_hours`: Decimal
- `notes`: Text
- `created_at`: DateTime

### AttendanceLog
- `id`: UUID (PK)
- `session_id`: UUID (FK)
- `type`: Enum (clock_in, clock_out)
- `timestamp`: DateTime
- `latitude`: Decimal
- `longitude`: Decimal
- `location_address`: Text
- `photo`: String (URL)
- `created_at`: DateTime

### BreakLog
- `id`: UUID (PK)
- `session_id`: UUID (FK)
- `break_number`: Integer (1 or 2)
- `start_time`: DateTime
- `end_time`: DateTime
- `duration_minutes`: Integer

### ActivityLog
- `id`: UUID (PK)
- `student_placement_id`: UUID (FK)
- `date`: Date
- `title`: String
- `description`: Text
- `photos`: JSON (array of URLs)
- `created_at`: DateTime
- `updated_at`: DateTime

### Report
- `id`: UUID (PK)
- `student_placement_id`: UUID (FK)
- `title`: String
- `content`: Text
- `report_type`: Enum (daily, weekly, monthly)
- `start_date`: Date
- `end_date`: Date
- `status`: Enum (draft, submitted, reviewed, approved)
- `reviewed_by`: UUID (FK to User)
- `reviewed_at`: DateTime
- `review_notes`: Text
- `created_at`: DateTime
- `updated_at`: DateTime
