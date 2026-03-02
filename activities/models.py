import uuid
from django.db import models


class ActivityLog(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    student_placement = models.ForeignKey('placements.StudentPlacement', on_delete=models.CASCADE, related_name='activities')
    date = models.DateField()
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    photos = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'activity_logs'
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.title} - {self.date}"
