

from rest_framework import serializers
from .models import Achievement
from qa.serializers import UserSerializer

class AchievementSerializer(serializers.ModelSerializer):
    student = UserSerializer(read_only=True)
    student_name = serializers.CharField(source='student.username', read_only=True)
    achievement_type_display = serializers.CharField(source='get_achievement_type_display', read_only=True)

    class Meta:
        model = Achievement
        fields = ['id', 'title', 'description', 'achievement_type', 'achievement_type_display', 'student', 'student_name', 'date_achieved', 'image', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class AchievementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = ['title', 'description', 'achievement_type', 'date_achieved', 'image']