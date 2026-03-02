export const getClockInTime = (attendance: any): string | null => {
  if (!attendance?.attendanceLogs) return null;
  const clockIn = attendance.attendanceLogs.find((log: any) => log.type === 'CLOCK_IN' || log.type === 'clock_in');
  return clockIn?.timestamp || null;
};

export const getClockOutTime = (attendance: any): string | null => {
  if (!attendance?.attendanceLogs) return null;
  const clockOut = attendance.attendanceLogs.find((log: any) => log.type === 'CLOCK_OUT' || log.type === 'clock_out');
  return clockOut?.timestamp || null;
};

export const formatTime = (isoString: string | null): string => {
  if (!isoString) return '-';
  return new Date(isoString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'present':
    case 'approved':
      return '#34C759';
    case 'absent':
    case 'rejected':
      return '#FF3B30';
    case 'late':
      return '#FF9500';
    case 'on_leave':
    case 'submitted':
      return '#5856D6';
    case 'draft':
      return '#8E8E93';
    default:
      return '#8E8E93';
  }
};

export const getStatusLabel = (status: string): string => {
  if (!status) return 'Unknown';
  return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
};

export const isActivePlacement = (placement: any): boolean => {
  return placement?.status === 'active' || placement?.status === 'ACTIVE';
};
