import uuid
from django.db import models


class PlacementStatus(models.TextChoices):
    ACTIVE = 'active', 'Active'
    COMPLETED = 'completed', 'Completed'
    TERMINATED = 'terminated', 'Terminated'


class StudentPlacement(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student = models.ForeignKey('users.User', on_delete=models.CASCADE, related_name='placements')
    internship_place = models.ForeignKey('places.InternshipPlace', on_delete=models.CASCADE, related_name='student_placements')
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=20, choices=PlacementStatus.choices, default=PlacementStatus.ACTIVE)
    supervisor_name = models.CharField(max_length=255, blank=True, null=True)
    supervisor_phone = models.CharField(max_length=20, blank=True, null=True)
    termination_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'student_placements'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.email} at {self.internship_place.name}"
