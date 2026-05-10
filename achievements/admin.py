from django.contrib import admin
from .models import Achievement

@admin.register(Achievement)
class AchievementAdmin(admin.ModelAdmin):
    list_display = ['title', 'achievement_type', 'student', 'date_achieved', 'created_at']
    list_filter = ['achievement_type', 'date_achieved']

