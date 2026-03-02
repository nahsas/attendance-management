import uuid
from django.db import models


class AttendanceStatus(models.TextChoices):
    PRESENT = 'present', 'Present'
    ABSENT = 'absent', 'Absent'
    LATE = 'late', 'Late'
    ON_LEAVE = 'on_leave', 'On Leave'


class AttendanceLogType(models.TextChoices):
    CLOCK_IN = 'clock_in', 'Clock In'
    CLOCK_OUT = 'clock_out', 'Clock Out'


class AttendanceSession(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_placement = models.ForeignKey('placements.StudentPlacement', on_delete=models.CASCADE, related_name='attendance_sessions')
    date = models.DateField()
    status = models.CharField(max_length=20, choices=AttendanceStatus.choices, default=AttendanceStatus.PRESENT)
    required_hours = models.DecimalField(max_digits=4, decimal_places=2, default=8.00)
    actual_hours = models.DecimalField(max_digits=4, decimal_places=2, blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'attendance_sessions'
        ordering = ['-date']
        unique_together = ['student_placement', 'date']

    def __str__(self):
        return f"{self.student_placement.student.email} - {self.date}"


class AttendanceLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='attendance_logs')
    type = models.CharField(max_length=20, choices=AttendanceLogType.choices)
    timestamp = models.DateTimeField(auto_now_add=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    location_address = models.TextField(blank=True, null=True)
    photo = models.URLField(blank=True, null=True)

    class Meta:
        db_table = 'attendance_logs'
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.type} - {self.timestamp}"


class BreakLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    session = models.ForeignKey(AttendanceSession, on_delete=models.CASCADE, related_name='break_logs')
    break_number = models.PositiveSmallIntegerField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(blank=True, null=True)
    duration_minutes = models.PositiveIntegerField(blank=True, null=True)

    class Meta:
        db_table = 'break_logs'

    def __str__(self):
        return f"Break {self.break_number} - {self.session}"
