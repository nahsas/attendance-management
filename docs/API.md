# GraphQL API Documentation

## Internship Management System

---

## 1. Schema Overview

### 1.1 Query Types

```graphql
type Query {
  # Authentication
  me: User
  
  # Schools
  schools: [School!]!
  school(id: ID!): School
  
  # Users
  users(role: UserRole, schoolId: ID): [User!]!
  user(id: ID!): User
  
  # Internship Places
  internshipPlaces(schoolId: ID!): [InternshipPlace!]!
  internshipPlace(id: ID!): InternshipPlace
  
  # Student Placements
  myPlacements: [StudentPlacement!]!
  studentPlacements(schoolId: ID, placeId: ID, status: PlacementStatus): [StudentPlacement!]!
  studentPlacement(id: ID!): StudentPlacement
  
  # Attendance
  myAttendanceSessions(startDate: Date, endDate: Date): [AttendanceSession!]!
  attendanceSessions(studentPlacementId: ID!, startDate: Date, endDate: Date): [AttendanceSession!]!
  attendanceSession(id: ID!): AttendanceSession
  
  # Activities
  myActivities(startDate: Date, endDate: Date): [ActivityLog!]!
  activities(studentPlacementId: ID!, startDate: Date, endDate: Date): [ActivityLog!]!
  activity(id: ID!): ActivityLog
  
  # Reports
  myReports(status: ReportStatus): [Report!]!
  reports(studentPlacementId: ID, status: ReportStatus, reviewBy: ID): [Report!]!
  report(id: ID!): Report
  
  # Analytics
  todayAttendanceSummary(schoolId: ID!): AttendanceSummary!
  schoolAnalytics(schoolId: ID!, startDate: Date!, endDate: Date!): SchoolAnalytics!
}
```

### 1.2 Mutation Types

```graphql
type Mutation {
  # Authentication
  login(email: String!, password: String!): AuthPayload!
  register(input: RegisterInput!): AuthPayload!
  logout: Boolean!
  changePassword(oldPassword: String!, newPassword: String!): Boolean!
  forgotPassword(email: String!): Boolean!
  
  # Schools
  createSchool(input: SchoolInput!): School!
  updateSchool(id: ID!, input: SchoolInput!): School!
  deleteSchool(id: ID!): Boolean!
  
  # Users
  createUser(input: UserInput!): User!
  updateUser(id: ID!, input: UserInput!): User!
  deleteUser(id: ID!): Boolean!
  
  # Internship Places
  createInternshipPlace(input: InternshipPlaceInput!): InternshipPlace!
  updateInternshipPlace(id: ID!, input: InternshipPlaceInput!): InternshipPlace!
  deleteInternshipPlace(id: ID!): Boolean!
  
  # Break Config
  createBreakConfig(input: BreakConfigInput!): BreakConfig!
  updateBreakConfig(id: ID!, input: BreakConfigInput!): BreakConfig!
  
  # Student Placements
  createStudentPlacement(input: StudentPlacementInput!): StudentPlacement!
  updateStudentPlacement(id: ID!, input: StudentPlacementInput!): StudentPlacement!
  terminatePlacement(id: ID!, reason: String): StudentPlacement!
  
  # Attendance
  clockIn(input: ClockInInput!): AttendanceSession!
  clockOut(sessionId: ID!): AttendanceSession!
  logBreak(sessionId: ID!, breakNumber: Int!, startTime: DateTime!): BreakLog!
  endBreak(breakLogId: ID!): BreakLog!
  markAttendance(sessionId: ID!, status: AttendanceStatus!, notes: String): AttendanceSession!
  
  # Activities
  createActivity(input: ActivityInput!): ActivityLog!
  updateActivity(id: ID!, input: ActivityInput!): ActivityLog!
  deleteActivity(id: ID!): Boolean!
  
  # Reports
  createReport(input: ReportInput!): Report!
  updateReport(id: ID!, input: ReportInput!): Report!
  submitReport(id: ID!): Report!
  reviewReport(id: ID!, status: ReportReviewStatus!, notes: String): Report!
}
```

---

## 2. Type Definitions

### 2.1 User Types

```graphql
enum UserRole {
  SUPERADMIN
  SCHOOL_ADMIN
  TEACHER
  STUDENT
}

type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  school: School
  phone: String
  avatar: String
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input RegisterInput {
  email: String!
  password: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  schoolId: ID
  phone: String
}

input UserInput {
  email: String
  firstName: String
  lastName: String
  phone: String
  role: UserRole
  schoolId: ID
  isActive: Boolean
}

type AuthPayload {
  token: String!
  user: User!
  expiresIn: Int!
}
```

### 2.2 School Types

```graphql
type School {
  id: ID!
  name: String!
  address: String
  phone: String
  email: String
  logo: String
  isActive: Boolean!
  createdAt: DateTime!
  updatedAt: DateTime!
  users: [User!]!
  internshipPlaces: [InternshipPlace!]!
}

input SchoolInput {
  name: String!
  address: String
  phone: String
  email: String
  logo: String
  isActive: Boolean
}
```

### 2.3 Internship Place Types

```graphql
type InternshipPlace {
  id: ID!
  school: School!
  name: String!
  address: String!
  phone: String
  email: String
  latitude: Float!
  longitude: Float!
  contactPerson: String
  contactPhone: String
  industry: String
  isActive: Boolean!
  breakConfig: BreakConfig
  studentPlacements: [StudentPlacement!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input InternshipPlaceInput {
  name: String!
  address: String!
  phone: String
  email: String
  latitude: Float!
  longitude: Float!
  contactPerson: String
  contactPhone: String
  industry: String
  isActive: Boolean
  breakConfig: BreakConfigInput
}
```

### 2.4 Break Configuration Types

```graphql
type BreakConfig {
  id: ID!
  internshipPlace: InternshipPlace!
  breakCount: Int!
  break1Start: Time
  break1End: Time
  break2Start: Time
  break2End: Time
  totalBreakMinutes: Int!
}

input BreakConfigInput {
  breakCount: Int!
  break1Start: Time
  break1End: Time
  break2Start: Time
  break2End: Time
}
```

### 2.5 Student Placement Types

```graphql
enum PlacementStatus {
  ACTIVE
  COMPLETED
  TERMINATED
}

type StudentPlacement {
  id: ID!
  student: User!
  internshipPlace: InternshipPlace!
  startDate: Date!
  endDate: Date!
  status: PlacementStatus!
  supervisorName: String
  supervisorPhone: String
  attendanceSessions: [AttendanceSession!]!
  activities: [ActivityLog!]!
  reports: [Report!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input StudentPlacementInput {
  studentId: ID!
  internshipPlaceId: ID!
  startDate: Date!
  endDate: Date!
  supervisorName: String
  supervisorPhone: String
}
```

### 2.6 Attendance Types

```graphql
enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  ON_LEAVE
}

enum AttendanceLogType {
  CLOCK_IN
  CLOCK_OUT
}

type AttendanceSession {
  id: ID!
  studentPlacement: StudentPlacement!
  date: Date!
  status: AttendanceStatus!
  requiredHours: Float!
  actualHours: Float
  notes: String
  clockIn: AttendanceLog
  clockOut: AttendanceLog
  breakLogs: [BreakLog!]!
  createdAt: DateTime!
}

type AttendanceLog {
  id: ID!
  session: AttendanceSession!
  type: AttendanceLogType!
  timestamp: DateTime!
  latitude: Float!
  longitude: Float!
  locationAddress: String
  photo: String
}

type BreakLog {
  id: ID!
  session: AttendanceSession!
  breakNumber: Int!
  startTime: DateTime!
  endTime: DateTime
  durationMinutes: Int
}

input ClockInInput {
  studentPlacementId: ID!
  latitude: Float!
  longitude: Float!
  locationAddress: String
  photo: String
}
```

### 2.7 Activity Types

```graphql
type ActivityLog {
  id: ID!
  studentPlacement: StudentPlacement!
  date: Date!
  title: String!
  description: String
  photos: [String!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

input ActivityInput {
  date: Date!
  title: String!
  description: String
  photos: [String!]
}
```

### 2.8 Report Types

```graphql
enum ReportType {
  DAILY
  WEEKLY
  MONTHLY
}

enum ReportStatus {
  DRAFT
  SUBMITTED
  REVIEWED
  APPROVED
  REJECTED
}

enum ReportReviewStatus {
  APPROVED
  REJECTED
}

type Report {
  id: ID!
  studentPlacement: StudentPlacement!
  title: String!
  content: String!
  reportType: ReportType!
  startDate: Date!
  endDate: Date!
  status: ReportStatus!
  reviewedBy: User
  reviewedAt: DateTime
  reviewNotes: String
  createdAt: DateTime!
  updatedAt: DateTime!
}

input ReportInput {
  studentPlacementId: ID
  title: String!
  content: String!
  reportType: ReportType!
  startDate: Date!
  endDate: Date!
}
```

### 2.9 Analytics Types

```graphql
type AttendanceSummary {
  totalStudents: Int!
  present: Int!
  absent: Int!
  late: Int!
  onLeave: Int!
}

type SchoolAnalytics {
  totalStudents: Int!
  activePlacements: Int!
  totalAttendanceDays: Int!
  averageAttendanceRate: Float!
  reportsSubmitted: Int!
  reportsApproved: Int!
  attendanceByDate: [DailyAttendance!]!
}

type DailyAttendance {
  date: Date!
  present: Int!
  absent: Int!
  late: Int!
}
```

---

## 3. Example Queries

### 3.1 Login
```graphql
mutation Login {
  login(email: "student@school.com", password: "password123") {
    token
    user {
      id
      firstName
      lastName
      role
      school {
        name
      }
    }
    expiresIn
  }
}
```

### 3.2 Get My Today's Attendance
```graphql
query MyTodayAttendance {
  myAttendanceSessions(startDate: "2026-03-02", endDate: "2026-03-02") {
    id
    date
    status
    requiredHours
    actualHours
    clockIn {
      timestamp
      locationAddress
    }
    clockOut {
      timestamp
    }
    breakLogs {
      breakNumber
      startTime
      endTime
      durationMinutes
    }
  }
}
```

### 3.3 Clock In
```graphql
mutation ClockIn {
  clockIn(input: {
    studentPlacementId: "uuid-here"
    latitude: -6.2088
    longitude: 106.8456
    locationAddress: "PT Maju Jaya, Jakarta"
  }) {
    id
    status
    clockIn {
      timestamp
    }
  }
}
```

### 3.4 Create Activity
```graphql
mutation CreateActivity {
  createActivity(input: {
    date: "2026-03-02"
    title: "Developed REST API"
    description: "Created user authentication endpoints"
    photos: ["https://example.com/photo1.jpg"]
  }) {
    id
    title
    createdAt
  }
}
```

### 3.5 Submit Report
```graphql
mutation SubmitReport {
  submitReport(id: "uuid-here") {
    id
    status
    updatedAt
  }
}
```

### 3.6 Teacher Reviews Report
```graphql
mutation ReviewReport {
  reviewReport(
    id: "uuid-here"
    status: APPROVED
    notes: "Good progress this week!"
  ) {
    id
    status
    reviewedAt
    reviewNotes
  }
}
```

### 3.7 Get School Dashboard
```graphql
query SchoolDashboard {
  todayAttendanceSummary(schoolId: "uuid-here") {
    totalStudents
    present
    absent
    late
    onLeave
  }
  schoolAnalytics(
    schoolId: "uuid-here"
    startDate: "2026-01-01"
    endDate: "2026-03-02"
  ) {
    totalStudents
    activePlacements
    averageAttendanceRate
    reportsApproved
  }
}
```

---

## 4. Pagination & Filtering

### 4.1 Connection Pattern
All list queries use Relay-style cursor-based pagination:

```graphql
type StudentPlacementConnection {
  edges: [StudentPlacementEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type StudentPlacementEdge {
  node: StudentPlacement!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

### 4.2 Usage Example
```graphql
query GetStudents {
  studentPlacements(
    first: 10
    after: "cursor-string"
    status: ACTIVE
  ) {
    edges {
      node {
        id
        student {
          firstName
          lastName
        }
        internshipPlace {
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

---

## 5. Error Handling

```graphql
type Error {
  field: String!
  message: String!
  code: String!
}

type MutationResult {
  success: Boolean!
  errors: [Error!]
}
```

Common error codes:
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User lacks permission
- `VALIDATION_ERROR` - Invalid input
- `NOT_FOUND` - Resource not found
- `ALREADY_EXISTS` - Duplicate entry
- `INVALID_CREDENTIALS` - Login failed

---

## 6. Rate Limiting

- Authentication endpoints: 5 requests/minute
- Read queries: 100 requests/minute
- Mutations: 30 requests/minute

---

## 7. API Versioning

The API is versioned via URL path:
```
https://api.internship-management.com/v1/graphql
```
