from django.test import TestCase
from django.contrib.auth.models import User
from .models import Question, Answer, Category, UserProfile


class QuestionModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.category = Category.objects.create(name='Test Category')
        
    def test_question_creation(self):
        question = Question.objects.create(
            title='Test Question',
            content='Test content',
            author=self.user,
            category=self.category
        )
        self.assertEqual(question.title, 'Test Question')
        self.assertEqual(question.author.username, 'testuser')
        
    def test_question_vote_score(self):
        question = Question.objects.create(
            title='Test Question',
            content='Test content',
            author=self.user,
            category=self.category
        )
        self.assertEqual(question.vote_score(), 0)


class UserProfileTest(TestCase):
    def test_profile_creation(self):
        user = User.objects.create_user(username='newuser', password='pass123')
        profile = UserProfile.objects.get(user=user)
        self.assertEqual(profile.reputation, 0)
        self.assertEqual(profile.user.username, 'newuser')
