import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    tokenAuth(email: $email, password: $password) {
      token
    }
  }
`;

export const GET_ME = gql`
  query GetMe {
    me {
      id
      email
      firstName
      lastName
      role
      school {
        id
        name
      }
    }
  }
`;

export const GET_MY_PLACEMENTS = gql`
  query GetMyPlacements {
    myPlacements {
      id
      status
      startDate
      endDate
      internshipPlace {
        id
        name
        address
        latitude
        longitude
        breakConfig {
          breakCount
          break1Start
          break1End
          break2Start
          break2End
        }
      }
    }
  }
`;

export const GET_MY_ATTENDANCE = gql`
  query GetMyAttendance($startDate: String, $endDate: String) {
    myAttendance(startDate: $startDate, endDate: $endDate) {
      id
      date
      status
      actualHours
      attendanceLogs {
        id
        type
        timestamp
      }
      breakLogs {
        id
        breakNumber
        startTime
        endTime
        durationMinutes
      }
    }
  }
`;

export const GET_TODAY_ATTENDANCE = gql`
  query GetTodayAttendance {
    todayAttendance {
      id
      date
      status
      actualHours
      attendanceLogs {
        id
        type
        timestamp
      }
      breakLogs {
        id
        breakNumber
        startTime
        endTime
        durationMinutes
      }
    }
  }
`;

export const CLOCK_IN_MUTATION = gql`
  mutation ClockIn($studentPlacementId: ID!, $latitude: Float!, $longitude: Float!, $locationAddress: String) {
    clockIn(input: {
      studentPlacementId: $studentPlacementId
      latitude: $latitude
      longitude: $longitude
      locationAddress: $locationAddress
    }) {
      attendanceSession {
        id
        date
        status
      }
    }
  }
`;

export const CLOCK_OUT_MUTATION = gql`
  mutation ClockOut($sessionId: ID!, $latitude: Float!, $longitude: Float!, $locationAddress: String) {
    clockOut(sessionId: $sessionId, latitude: $latitude, longitude: $longitude, locationAddress: $locationAddress) {
      attendanceSession {
        id
        date
        status
        actualHours
      }
    }
  }
`;

export const LOG_BREAK_MUTATION = gql`
  mutation LogBreak($sessionId: ID!, $breakNumber: Int!) {
    logBreak(sessionId: $sessionId, breakNumber: $breakNumber) {
      breakLog {
        id
        breakNumber
        startTime
      }
    }
  }
`;

export const END_BREAK_MUTATION = gql`
  mutation EndBreak($breakLogId: ID!) {
    endBreak(breakLogId: $breakLogId) {
      breakLog {
        id
        breakNumber
        startTime
        endTime
        durationMinutes
      }
    }
  }
`;

export const GET_MY_ACTIVITIES = gql`
  query GetMyActivities($date: String) {
    myActivities(date: $date) {
      id
      title
      description
      date
      photos
    }
  }
`;

export const CREATE_ACTIVITY_MUTATION = gql`
  mutation CreateActivity($title: String!, $description: String!, $photos: [String]) {
    createActivity(input: {
      title: $title
      description: $description
      photos: $photos
    }) {
      activity {
        id
        title
        description
        date
        photos
      }
    }
  }
`;

export const GET_MY_REPORTS = gql`
  query GetMyReports {
    myReports {
      id
      title
      content
      reportType
      startDate
      endDate
      status
      reviewNotes
      createdAt
    }
  }
`;

export const CREATE_REPORT_MUTATION = gql`
  mutation CreateReport($title: String!, $content: String!, $reportType: String!, $startDate: Date!, $endDate: Date!) {
    createReport(input: {
      title: $title
      content: $content
      reportType: $reportType
      startDate: $startDate
      endDate: $endDate
    }) {
      report {
        id
        title
        status
      }
    }
  }
`;

export const SUBMIT_REPORT_MUTATION = gql`
  mutation SubmitReport($id: ID!) {
    submitReport(id: $id) {
      report {
        id
        status
      }
    }
  }
`;

export const UPDATE_REPORT_MUTATION = gql`
  mutation UpdateReport($id: ID!, $title: String, $content: String) {
    updateReport(id: $id, title: $title, content: $content) {
      report {
        id
        title
        content
        status
      }
    }
  }
`;
