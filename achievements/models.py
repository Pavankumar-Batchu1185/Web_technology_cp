from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Achievement(models.Model):
    ACHIEVEMENT_TYPES = [
        ('academic', 'Academic'),
        ('sports', 'Sports'),
        ('arts', 'Arts'),
        ('community', 'Community'),
        ('other', 'Other'),
    ]
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    achievement_type = models.CharField(max_length=20, choices=ACHIEVEMENT_TYPES)
    student = models.ForeignKey(User, on_delete=models.CASCADE)
    date_achieved = models.DateField()
    image = models.ImageField(upload_to='achievements/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-date_achieved']

