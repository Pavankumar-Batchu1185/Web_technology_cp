from django.test import TestCase
from django.contrib.auth.models import User
from .models import Achievement
from datetime import date


class AchievementModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        
    def test_achievement_creation(self):
        achievement = Achievement.objects.create(
            title='Test Achievement',
            description='Test description',
            achievement_type='hackathon',
            date_achieved=date.today(),
            student=self.user
        )
        self.assertEqual(achievement.title, 'Test Achievement')
        self.assertEqual(achievement.student.username, 'testuser')
        self.assertEqual(achievement.achievement_type, 'hackathon')
