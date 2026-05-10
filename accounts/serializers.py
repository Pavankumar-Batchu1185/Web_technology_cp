from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import StaffProfile

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['is_staff'] = user.is_staff
        try:
            token['role'] = user.staff_profile.role
            token['department'] = user.staff_profile.department
        except StaffProfile.DoesNotExist:
            token['role'] = 'student'
            token['department'] = ''
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        try:
            staff = self.user.staff_profile
            data['role'] = staff.role
            data['department'] = staff.department
        except StaffProfile.DoesNotExist:
            data['role'] = 'student'
            data['department'] = ''
        data['is_staff'] = self.user.is_staff
        return data