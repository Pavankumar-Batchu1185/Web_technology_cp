from django.db import models
from django.contrib.auth.models import User

class StaffProfile(models.Model):
    ROLE_CHOICES = [
        ('hod', 'Head of Department'),
        ('dean', 'Dean'),
        ('faculty', 'Faculty Member'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='staff_profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=50, blank=True, unique=True, null=True)

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()})"