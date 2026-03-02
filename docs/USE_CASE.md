# Use Case Diagrams

## Internship Management System

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INTERNSHIP MANAGEMENT SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐ │
│   │ Superadmin  │    │School Admin │    │  Teacher    │    │  Student    │ │
│   └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Student Use Cases

### 2.1 Use Case Diagram

```
                         ┌──────────────────┐
                         │     STUDENT      │
                         └────────┬─────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│   ATTENDANCE  │        │   ACTIVITIES  │        │    REPORTS    │
└───────┬───────┘        └───────┬───────┘        └───────┬───────┘
        │                         │                         │
        │ ┌───────────┐           │ ┌───────────┐          │ ┌───────────┐
        ├►│  Clock In │           ├►│   Create  │          ├►│   Create  │
        │ └───────────┘           │ └───────────┘          │ └───────────┘
        │ ┌───────────┐           │ ┌───────────┐          │ ┌───────────┐
        ├►│ Clock Out │           ├►│   View    │          ├►│   Edit    │
        │ └───────────┘           │ └───────────┘          │ └───────────┘
        │ ┌───────────┐           │ ┌───────────┐          │ ┌───────────┐
        ├►│  Log Break│           ├►│  Delete   │          ├►│  Submit   │
        │ └───────────┘           │ └───────────┘          │ └───────────┘
        │ ┌───────────┐           │                       │ ┌───────────┐
        ├►│  View     │           │                       ├►│   View    │
        │ │  History  │           │                       │ │  History  │
        │ └───────────┘           │                       │ └───────────┘
        │                         │                       │
        └─────────────────────────┴─────────────────────────┘
```

### 2.2 Use Case Descriptions

| Use Case | Description | Pre-condition | Post-condition |
|----------|-------------|----------------|-----------------|
| Clock In | Student clocks in at internship location | Has active placement, within 500m of location | Session created with clock_in log |
| Clock Out | Student clocks out at end of day | Has active session with clock_in | Session completed, actual_hours calculated |
| Log Break | Student logs break start/end | Session is active | Break logged with duration |
| Create Activity | Student adds daily activity | Has active placement | Activity created |
| Edit Activity | Student updates activity | Activity is own, not submitted | Activity updated |
| Create Report | Student creates new report | Has active placement | Report created as draft |
| Submit Report | Student submits report for review | Report is in draft status | Report status changed to submitted |

---

## 3. Teacher Use Cases

### 3.1 Use Case Diagram

```
                         ┌──────────────────┐
                         │    TEACHER       │
                         └────────┬─────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│   STUDENTS    │        │   ATTENDANCE  │        │    REPORTS    │
└───────┬───────┘        └───────┬───────┘        └───────┬───────┘
        │                         │                         │
        │ ┌───────────┐           │ ┌───────────┐          │ ┌───────────┐
        ├►│   View    │           ├►│   View    │          ├►│   View    │
        │ │   List    │           │ │   Live    │          │ │   Queue   │
        │ └───────────┘           │ └───────────┘          │ └───────────┘
        │ ┌───────────┐           │ ┌───────────┐          │ ┌───────────┐
        ├►│   Filter  │           ├►│   View    │          ├►│  Approve  │
        │ │  by Place │           │ │  History  │          │ │           │
        │ └───────────┘           │ └───────────┘          │ └───────────┘
        │ ┌───────────┐           │ ┌───────────┐          │ ┌───────────┐
        ├►│   View    │           ├►│   Mark    │          ├►│  Reject   │
        │ │  Details  │           │ │ Absent/Late│          │ │           │
        │ └───────────┘           │ └───────────┘          │ └───────────┘
        │                         │                         │
        └─────────────────────────┴─────────────────────────┘
```

### 3.2 Use Case Descriptions

| Use Case | Description | Pre-condition | Post-condition |
|----------|-------------|----------------|-----------------|
| View Students | View all students in school | Teacher authenticated | List of students returned |
| Filter Students | Filter by internship place | None | Filtered list returned |
| View Live Attendance | See real-time attendance | None | Today's attendance shown |
| Mark Attendance | Mark student absent/late/leave | Has permission | Attendance status updated |
| View Report Queue | See reports pending review | None | List of submitted reports |
| Review Report | Approve or reject report | Report is submitted | Report status updated with notes |

---

## 4. School Admin Use Cases

### 4.1 Use Case Diagram

```
                         ┌──────────────────┐
                         │  SCHOOL ADMIN    │
                         └────────┬─────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│    SCHOOL     │        │    PLACES     │        │    USERS      │
└───────┬───────┘        └───────┬───────┘        └───────┬───────┘
        │                         │                         │
        │ ┌───────────┐           │ ┌───────────┐          │ ┌───────────┐
        ├►│  Manage   │           ├►│   Create  │          ├►│   Create  │
        │ │  Profile  │           │ │           │          │ │   User    │
        │ └───────────┘           │ └───────────┘          │ └───────────┘
        │                         │ ┌───────────┐          │ ┌───────────┐
        │                         ├►│   Edit    │          ├►│   Edit    │
        │                         │ │           │          │ │   User    │
        │                         │ └───────────┘          │ └───────────┘
        │                         │ ┌───────────┐          │ ┌───────────┐
        │                         ├►│Configure  │          ├►│   Delete  │
        │                         │ │  Breaks   │          │ │   User    │
        │                         │ └───────────┘          │ └───────────┘
        │                         │                         │
        └─────────────────────────┴─────────────────────────┘
                                  │
                                  ▼
                    ┌───────────────────────┐
                    │     PLACEMENTS        │
                    └───────────┬───────────┘
                                │
                    ┌───────────┴───────────┐
                    │ ┌───────────┐          │
                    ├►│  Assign   │          │
                    │ │  Student  │          │
                    │ └───────────┘          │
                    │ ┌───────────┐          │
                    ├►│  Terminate│          │
                    │ │           │          │
                    │ └───────────┘          │
```

### 4.2 Use Case Descriptions

| Use Case | Description | Pre-condition | Post-condition |
|----------|-------------|----------------|-----------------|
| Manage School | Update school details | School admin role | School updated |
| Create Place | Add new internship place | None | Place created |
| Edit Place | Update place details | Place exists | Place updated |
| Configure Breaks | Set break schedule (1 or 2) | Place exists | Break config updated |
| Create User | Add teacher/student | None | User created |
| Edit User | Update user details | User exists | User updated |
| Delete User | Deactivate user | User exists | User deactivated |
| Assign Student | Assign student to place | Student and place exist | Placement created |
| Terminate Placement | End placement early | Placement active | Placement terminated |

---

## 5. Superadmin Use Cases

### 5.1 Use Case Diagram

```
                         ┌──────────────────┐
                         │   SUPERADMIN    │
                         └────────┬─────────┘
                                  │
        ┌─────────────────────────┼─────────────────────────┐
        │                         │                         │
        ▼                         ▼                         ▼
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│    SCHOOLS    │        │    SYSTEM     │        │   ANALYTICS   │
└───────┬───────┘        └───────┬───────┘        └───────┬───────┘
        │                         │                         │
        │ ┌───────────┐           │ ┌───────────┐          │ ┌───────────┐
        ├►│   Create  │           ├►│   View    │          ├►│   View    │
        │ │           │           │ │  Settings │          │ │   Stats   │
        │ └───────────┘           │ └───────────┘          │ └───────────┘
        │ ┌───────────┐           │                         │
        ├►│   Edit    │           │                         │
        │ │           │           │                         │
        │ └───────────┘           │                         │
        │ ┌───────────┐           │                         │
        ├►│   Delete  │           │                         │
        │ │           │           │                         │
        │ └───────────┘           │                         │
        │                         │                         │
        └─────────────────────────┴─────────────────────────┘
```

### 5.2 Use Case Descriptions

| Use Case | Description | Pre-condition | Post-condition |
|----------|-------------|----------------|-----------------|
| Create School | Add new school | None | School created |
| Edit School | Update school | School exists | School updated |
| Delete School | Remove school | School exists | School deactivated |
| View Settings | View system configuration | Superadmin role | Settings shown |

---

## 6. Extended Use Cases

### 6.1 Complete Attendance Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ATTENDANCE USE CASES                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│  │  Clock   │────►│ Validate │────►│  Create  │────►│  Update  │          │
│  │   In     │     │ Location │     │  Session │     │  Status  │          │
│  └──────────┘     └──────────┘     └──────────┘     └──────────┘          │
│                                                                    │         │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                   │         │
│  │  Log    │◄────│ Validate │◄────│  Start   │◄──────────────────┘         │
│  │  Break  │     │  Break # │     │  Break   │                              │
│  └──────────┘     └──────────┘     └──────────┘                              │
│                                                                    │         │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                   │         │
│  │  End    │────►│ Calculate│────►│ Calculate│◄──────────────────┘         │
│  │  Break   │     │ Duration │     │  Hours   │                              │
│  └──────────┘     └──────────┘     └──────────┘                              │
│                                                                    │         │
│  ┌──────────┐     ┌──────────┐     ┌──────────┐                   │         │
│  │  Clock  │────►│  Update  │────►│ Complete │◄──────────────────┘         │
│  │  Out    │     │  Session │     │          │                              │
│  └──────────┘     └──────────┘     └──────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Report Workflow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REPORT USE CASES                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│   │ Create  │────►│   Save   │────►│  Edit    │────►│ Submit   │          │
│   │ Report  │     │  Draft   │     │  Draft   │     │          │          │
│   └──────────┘     └──────────┘     └──────────┘     └────┬─────┘          │
│                                                          │                 │
│                                                          ▼                 │
│   ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐          │
│   │  View   │◄────│ Return   │◄────│ Reject/  │◄────│  Teacher │          │
│   │ History │     │  for Rev │     │ Approve  │     │  Review  │          │
│   └──────────┘     └──────────┘     └──────────┘     └──────────┘          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Use Case Matrix

| Use Case | Student | Teacher | School Admin | Superadmin |
|----------|---------|---------|--------------|------------|
| Login/Logout | Yes | Yes | Yes | Yes |
| View Profile | Yes | Yes | Yes | Yes |
| Clock In/Out | Yes | - | - | - |
| Log Break | Yes | - | - | - |
| View Attendance | Own | All School | All School | All |
| Mark Attendance | - | Yes | Yes | - |
| Create Activity | Yes | - | - | - |
| View Activities | Own | All School | All School | All |
| Create Report | Yes | - | - | - |
| Submit Report | Yes | - | - | - |
| Review Report | - | Yes | Yes | - |
| Manage School | - | - | Own | All |
| Manage Places | - | - | Own School | All |
| Manage Placements | - | - | Own School | All |
| Manage Users | - | - | Own School | All |
| View Analytics | Own | School | School | System |
| Manage Super Settings | - | - | - | Yes |

---

## 8. Sequence Diagrams

### 8.1 Student Clock In Sequence

```
Student                          App                          API                    Database
  │                               │                             │                        │
  │  1. Tap Clock In             │                             │                        │
  │──────────────────────────────>│                             │                        │
  │                               │  2. Get GPS Location        │                        │
  │                               │────────────────────────────>│                        │
  │                               │<────────────────────────────│                        │
  │                               │                             │                        │
  │                               │  3. ClockIn Mutation        │                        │
  │                               │────────────────────────────>│                        │
  │                               │                             │  4. Validate Location │
  │                               │                             │──────────────────────>│
  │                               │                             │<──────────────────────│
  │                               │                             │                        │
  │                               │                             │  5. Create Session    │
  │                               │                             │──────────────────────>│
  │                               │                             │<──────────────────────│
  │                               │                             │                        │
  │                               │  6. Return Success          │                        │
  │                               │<────────────────────────────│                        │
  │                               │                             │                        │
  │  7. Show Confirmation       │                             │                        │
  │<──────────────────────────────│                             │                        │
  │                               │                             │                        │
```

### 8.2 Teacher Review Report Sequence

```
Teacher                         App                          API                    Database
  │                               │                             │                        │
  │  1. View Report Queue        │                             │                        │
  │──────────────────────────────>│                             │                        │
  │                               │  2. Get Reports Query       │                        │
  │                               │────────────────────────────>│                        │
  │                               │                             │  3. Fetch Reports    │
  │                               │                             │──────────────────────>│
  │                               │                             │<──────────────────────│
  │                               │                             │                        │
  │                               │  4. Return Reports         │                        │
  │                               │<────────────────────────────│                        │
  │                               │                             │                        │
  │  5. Select Report           │                             │                        │
  │──────────────────────────────>│                             │                        │
  │                               │                             │                        │
  │  6. Review (Approve/Reject)│                             │                        │
  │──────────────────────────────>│                             │                        │
  │                               │  7. ReviewReport Mutation  │                        │
  │                               │────────────────────────────>│                        │
  │                               │                             │  8. Update Status    │
  │                               │                             │──────────────────────>│
  │                               │                             │<──────────────────────│
  │                               │                             │                        │
  │                               │  9. Return Updated Report  │                        │
  │                               │<────────────────────────────│                        │
  │                               │                             │                        │
  │  10. Show Updated Status    │                             │                        │
  │<──────────────────────────────│                             │                        │
  │                               │                             │                        │
```
