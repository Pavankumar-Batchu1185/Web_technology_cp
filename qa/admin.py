from django.contrib import admin
from .models import Category, Question, Answer, Tag, UserProfile, Announcement
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']

@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ['name']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['title', 'category', 'author', 'created_at']
    list_filter = ['category', 'created_at']
    filter_horizontal = ['tags']

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['question', 'author', 'is_best', 'created_at']
    list_filter = ['is_best', 'created_at']

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'reputation']

@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'tag', 'author', 'is_pinned', 'created_at']
    list_filter = ['tag', 'is_pinned']
    search_fields = ['title', 'content']

