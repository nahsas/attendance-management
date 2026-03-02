export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'superadmin' | 'school_admin' | 'teacher' | 'student';
  school?: School;
}

export interface School {
  id: string;
  name: string;
  address: string;
  phone?: string;
}

export interface Place {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  breakConfig: BreakConfig;
}

export interface BreakConfig {
  breakCount: 1 | 2;
  break1Start?: string;
  break1End?: string;
  break2Start?: string;
  break2End?: string;
}

export interface StudentPlacement {
  id: string;
  student: User;
  place: Place;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AttendanceSession {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'on_leave';
  actualHours?: number;
  clockInTime?: string;
  clockOutTime?: string;
  notes?: string;
}

export interface Activity {
  id: string;
  studentPlacement: StudentPlacement;
  title: string;
  description: string;
  date: string;
  photos: string[];
}

export interface Report {
  id: string;
  studentPlacement: StudentPlacement;
  title: string;
  content: string;
  reportType: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedBy?: User;
  createdAt: string;
}

export interface AuthTokens {
  token: string;
  refreshToken?: string;
}
