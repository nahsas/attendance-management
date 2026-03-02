import uuid
from django.db import models


class InternshipPlace(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    school = models.ForeignKey('schools.School', on_delete=models.CASCADE, related_name='internship_places')
    name = models.CharField(max_length=255)
    address = models.TextField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    contact_person = models.CharField(max_length=255, blank=True, null=True)
    contact_phone = models.CharField(max_length=20, blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'internship_places'
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class BreakConfig(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    internship_place = models.OneToOneField(InternshipPlace, on_delete=models.CASCADE, related_name='break_config')
    break_count = models.PositiveSmallIntegerField(default=1)
    break1_start = models.TimeField(blank=True, null=True)
    break1_end = models.TimeField(blank=True, null=True)
    break2_start = models.TimeField(blank=True, null=True)
    break2_end = models.TimeField(blank=True, null=True)
    total_break_minutes = models.PositiveIntegerField(default=60)

    class Meta:
        db_table = 'break_configs'

    def __str__(self):
        return f"Break config for {self.internship_place.name}"
