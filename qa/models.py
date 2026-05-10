from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name_plural = "Categories"

class Tag(models.Model):
    name = models.CharField(max_length=50, unique=True)
    
    def __str__(self):
        return self.name

class Question(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    tags = models.ManyToManyField(Tag, blank=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='questions/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    upvotes = models.ManyToManyField(User, related_name='question_upvotes', blank=True)
    downvotes = models.ManyToManyField(User, related_name='question_downvotes', blank=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']
    
    def vote_score(self):
        return self.upvotes.count() - self.downvotes.count()
    
    def time_since(self):
        diff = timezone.now() - self.created_at
        if diff.days > 365:
            return f"{diff.days // 365}y ago"
        if diff.days > 30:
            return f"{diff.days // 30}mo ago"
        if diff.days > 0:
            return f"{diff.days}d ago"
        if diff.seconds > 3600:
            return f"{diff.seconds // 3600}h ago"
        if diff.seconds > 60:
            return f"{diff.seconds // 60}m ago"
        return "just now"

class Answer(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='answers')
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_best = models.BooleanField(default=False)
    upvotes = models.ManyToManyField(User, related_name='answer_upvotes', blank=True)
    downvotes = models.ManyToManyField(User, related_name='answer_downvotes', blank=True)

    def __str__(self):
        return f"Answer to {self.question.title}"

    class Meta:
        ordering = ['-is_best', '-created_at']
    
    def vote_score(self):
        return self.upvotes.count() - self.downvotes.count()
    
    def time_since(self):
        diff = timezone.now() - self.created_at
        if diff.days > 365:
            return f"{diff.days // 365}y ago"
        if diff.days > 30:
            return f"{diff.days // 30}mo ago"
        if diff.days > 0:
            return f"{diff.days}d ago"
        if diff.seconds > 3600:
            return f"{diff.seconds // 3600}h ago"
        if diff.seconds > 60:
            return f"{diff.seconds // 60}m ago"
        return "just now"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    reputation = models.IntegerField(default=0)
    bio = models.TextField(blank=True)
    banner_image = models.ImageField(
    upload_to='banners/',
    blank=True,
    null=True
)
    
    def __str__(self):
        return f"{self.user.username}'s profile"


class Announcement(models.Model):
    TAG_CHOICES = [
        ('general', 'General'),
        ('academic', 'Academic'),
        ('event', 'Event'),
        ('urgent', 'Urgent'),
        ('placement', 'Placement'),
        ('exam', 'Exam'),
    ]
    title = models.CharField(max_length=200)
    content = models.TextField()
    tag = models.CharField(max_length=20, choices=TAG_CHOICES, default='general')
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_pinned = models.BooleanField(default=False)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-is_pinned', '-created_at']