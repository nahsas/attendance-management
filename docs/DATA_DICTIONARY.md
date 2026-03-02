# Data Dictionary

## Internship Management System

---

## 1. User Table

### Table: `users`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User email address |
| password | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| first_name | VARCHAR(100) | NOT NULL | First name |
| last_name | VARCHAR(100) | NOT NULL | Last name |
| role | ENUM | NOT NULL | superadmin, school_admin, teacher, student |
| school_id | UUID | FK -> schools.id | Reference to school (nullable for superadmin) |
| phone | VARCHAR(20) | NULLABLE | Phone number |
| avatar | VARCHAR(500) | NULLABLE | URL to avatar image |
| is_active | BOOLEAN | DEFAULT TRUE | Account status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

---

## 2. School Table

### Table: `schools`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| name | VARCHAR(255) | NOT NULL | School name |
| address | TEXT | NULLABLE | Full address |
| phone | VARCHAR(20) | NULLABLE | Contact phone |
| email | VARCHAR(255) | NULLABLE | Contact email |
| logo | VARCHAR(500) | NULLABLE | URL to logo image |
| is_active | BOOLEAN | DEFAULT TRUE | School active status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

---

## 3. Internship Place Table

### Table: `internship_places`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| school_id | UUID | FK -> schools.id, NOT NULL | Reference to school |
| name | VARCHAR(255) | NOT NULL | Company/place name |
| address | TEXT | NOT NULL | Full address |
| phone | VARCHAR(20) | NULLABLE | Company phone |
| email | VARCHAR(255) | NULLABLE | Company email |
| latitude | DECIMAL(10,8) | NOT NULL | GPS latitude |
| longitude | DECIMAL(11,8) | NOT NULL | GPS longitude |
| contact_person | VARCHAR(255) | NULLABLE | Contact person name |
| contact_phone | VARCHAR(20) | NULLABLE | Contact person phone |
| industry | VARCHAR(100) | NULLABLE | Industry type |
| is_active | BOOLEAN | DEFAULT TRUE | Place active status |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

---

## 4. Break Configuration Table

### Table: `break_configs`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| internship_place_id | UUID | FK -> internship_places.id, NOT NULL, UNIQUE | Reference to place |
| break_count | INTEGER | NOT NULL, CHECK (1 or 2) | Number of breaks |
| break1_start | TIME | NULLABLE | First break start |
| break1_end | TIME | NULLABLE | First break end |
| break2_start | TIME | NULLABLE | Second break start |
| break2_end | TIME | NULLABLE | Second break end |
| total_break_minutes | INTEGER | NOT NULL | Total break time in minutes |

---

## 5. Student Placement Table

### Table: `student_placements`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| student_id | UUID | FK -> users.id, NOT NULL | Reference to student |
| internship_place_id | UUID | FK -> internship_places.id, NOT NULL | Reference to place |
| start_date | DATE | NOT NULL | Placement start date |
| end_date | DATE | NOT NULL | Placement end date |
| status | ENUM | NOT NULL, DEFAULT 'active' | active, completed, terminated |
| supervisor_name | VARCHAR(255) | NULLABLE | Supervisor name |
| supervisor_phone | VARCHAR(20) | NULLABLE | Supervisor phone |
| termination_reason | TEXT | NULLABLE | Reason if terminated |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

---

## 6. Attendance Session Table

### Table: `attendance_sessions`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| student_placement_id | UUID | FK -> student_placements.id, NOT NULL | Reference to placement |
| date | DATE | NOT NULL | Session date |
| status | ENUM | NOT NULL | present, absent, late, on_leave |
| required_hours | DECIMAL(4,2) | NOT NULL, DEFAULT 8.00 | Required work hours |
| actual_hours | DECIMAL(4,2) | NULLABLE | Actual hours worked |
| notes | TEXT | NULLABLE | Additional notes |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

---

## 7. Attendance Log Table

### Table: `attendance_logs`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| session_id | UUID | FK -> attendance_sessions.id, NOT NULL | Reference to session |
| type | ENUM | NOT NULL | clock_in, clock_out |
| timestamp | TIMESTAMP | NOT NULL | Log timestamp |
| latitude | DECIMAL(10,8) | NOT NULL | GPS latitude at log |
| longitude | DECIMAL(11,8) | NOT NULL | GPS longitude at log |
| location_address | TEXT | NULLABLE | Address at log time |
| photo | VARCHAR(500) | NULLABLE | URL to photo proof |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |

---

## 8. Break Log Table

### Table: `break_logs`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| session_id | UUID | FK -> attendance_sessions.id, NOT NULL | Reference to session |
| break_number | INTEGER | NOT NULL | 1 or 2 |
| start_time | TIMESTAMP | NOT NULL | Break start |
| end_time | TIMESTAMP | NULLABLE | Break end |
| duration_minutes | INTEGER | NULLABLE | Calculated duration |

---

## 9. Activity Log Table

### Table: `activity_logs`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| student_placement_id | UUID | FK -> student_placements.id, NOT NULL | Reference to placement |
| date | DATE | NOT NULL | Activity date |
| title | VARCHAR(255) | NOT NULL | Activity title |
| description | TEXT | NULLABLE | Detailed description |
| photos | JSON | NULLABLE | Array of photo URLs |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

---

## 10. Report Table

### Table: `reports`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier |
| student_placement_id | UUID | FK -> student_placements.id, NOT NULL | Reference to placement |
| title | VARCHAR(255) | NOT NULL | Report title |
| content | TEXT | NOT NULL | Report content |
| report_type | ENUM | NOT NULL | daily, weekly, monthly |
| start_date | DATE | NOT NULL | Report period start |
| end_date | DATE | NOT NULL | Report period end |
| status | ENUM | NOT NULL, DEFAULT 'draft' | draft, submitted, reviewed, approved, rejected |
| reviewed_by | UUID | FK -> users.id, NULLABLE | Reviewer user |
| reviewed_at | TIMESTAMP | NULLABLE | Review timestamp |
| review_notes | TEXT | NULLABLE | Review comments |
| created_at | TIMESTAMP | NOT NULL | Creation timestamp |
| updated_at | TIMESTAMP | NOT NULL | Last update timestamp |

---

## 11. Indexes

| Table | Index Name | Columns | Type |
|-------|------------|---------|------|
| users | idx_users_email | email | UNIQUE |
| users | idx_users_school_id | school_id | INDEX |
| users | idx_users_role | role | INDEX |
| internship_places | idx_places_school_id | school_id | INDEX |
| student_placements | idx_placements_student_id | student_id | INDEX |
| student_placements | idx_placements_place_id | internship_place_id | INDEX |
| student_placements | idx_placements_status | status | INDEX |
| attendance_sessions | idx_sessions_placement_date | student_placement_id, date | UNIQUE |
| attendance_sessions | idx_sessions_date | date | INDEX |
| activity_logs | idx_activities_placement_date | student_placement_id, date | INDEX |
| reports | idx_reports_placement_status | student_placement_id, status | INDEX |

---

## 12. Enumerations

### UserRole
```sql
CREATE TYPE user_role AS ENUM ('superadmin', 'school_admin', 'teacher', 'student');
```

### PlacementStatus
```sql
CREATE TYPE placement_status AS ENUM ('active', 'completed', 'terminated');
```

### AttendanceStatus
```sql
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'late', 'on_leave');
```

### AttendanceLogType
```sql
CREATE TYPE attendance_log_type AS ENUM ('clock_in', 'clock_out');
```

### ReportType
```sql
CREATE TYPE report_type AS ENUM ('daily', 'weekly', 'monthly');
```

### ReportStatus
```sql
CREATE TYPE report_status AS ENUM ('draft', 'submitted', 'reviewed', 'approved', 'rejected');
```

---

## 13. Relationships (Foreign Keys)

| Child Table | Parent Table | Constraint Name |
|-------------|--------------|-----------------|
| users | schools | fk_users_school |
| internship_places | schools | fk_places_school |
| break_configs | internship_places | fk_breakconfig_place |
| student_placements | users | fk_placements_student |
| student_placements | internship_places | fk_placements_place |
| attendance_sessions | student_placements | fk_sessions_placement |
| attendance_logs | attendance_sessions | fk_logs_session |
| break_logs | attendance_sessions | fk_breaklogs_session |
| activity_logs | student_placements | fk_activities_placement |
| reports | student_placements | fk_reports_placement |
| reports | users | fk_reports_reviewer |

---

## 14. Validation Rules

| Field | Rule |
|-------|------|
| user.email | Valid email format, unique |
| user.password | Minimum 8 characters |
| user.role | Must be valid enum value |
| school.name | Required, max 255 chars |
| internship_place.name | Required, max 255 chars |
| internship_place.latitude | Between -90 and 90 |
| internship_place.longitude | Between -180 and 180 |
| break_config.break_count | Must be 1 or 2 |
| student_placement.start_date | Must be before or equal to end_date |
| attendance_session.actual_hours | Cannot exceed 24 |
| report.content | Required, min 10 characters |
