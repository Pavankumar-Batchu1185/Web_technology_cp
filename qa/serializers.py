
from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Tag, Question, Answer, UserProfile, Announcement

class UserSerializer(serializers.ModelSerializer):
    reputation = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    department = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'reputation', 'role', 'department', 'is_staff']

    def get_reputation(self, obj):
        return obj.userprofile.reputation if hasattr(obj, 'userprofile') else 0
    
    def get_role(self, obj):
        if hasattr(obj, 'staff_profile'):
            return obj.staff_profile.role
        return 'student'
    
    def get_department(self, obj):
        if hasattr(obj, 'staff_profile'):
            return obj.staff_profile.department
        return ''

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=['student', 'faculty', 'hod', 'dean'], required=False, write_only=True)
    department = serializers.CharField(required=False, write_only=True, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'role', 'department']

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError("Passwords do not match")
        if User.objects.filter(username=data['username']).exists():
            raise serializers.ValidationError("Username already taken")
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError("Email already registered")
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        role = validated_data.pop('role', 'student')
        department = validated_data.pop('department', '')
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        
        # Create StaffProfile if role is not student
        if role in ['faculty', 'hod', 'dean']:
            from accounts.models import StaffProfile
            user.is_staff = True
            user.save()
            StaffProfile.objects.create(
                user=user,
                role=role,
                department=department
            )
        
        return user
    
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'created_at']

class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ['id', 'name']

class AnswerSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    vote_score = serializers.SerializerMethodField()
    upvote_count = serializers.SerializerMethodField()
    downvote_count = serializers.SerializerMethodField()
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Answer
        fields = ['id', 'question', 'content', 'author', 'is_best', 'vote_score', 'upvote_count', 'downvote_count', 'time_since', 'created_at', 'updated_at']
        read_only_fields = ['is_best', 'created_at', 'updated_at']
    
    def get_vote_score(self, obj):
        return obj.vote_score()
    
    def get_upvote_count(self, obj):
        return obj.upvotes.count()
    
    def get_downvote_count(self, obj):
        return obj.downvotes.count()
    
    def get_time_since(self, obj):
        return obj.time_since()

class QuestionListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    answer_count = serializers.SerializerMethodField()
    vote_score = serializers.SerializerMethodField()
    upvote_count = serializers.SerializerMethodField()
    downvote_count = serializers.SerializerMethodField()
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'title', 'content', 'category', 'tags', 'author', 'image', 'vote_score', 'upvote_count', 'downvote_count', 'answer_count', 'time_since', 'created_at']
    
    def get_answer_count(self, obj):
        return obj.answers.count()
    
    def get_vote_score(self, obj):
        return obj.vote_score()
    
    def get_upvote_count(self, obj):
        return obj.upvotes.count()
    
    def get_downvote_count(self, obj):
        return obj.downvotes.count()
    
    def get_time_since(self, obj):
        return obj.time_since()

class QuestionDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)
    answers = AnswerSerializer(many=True, read_only=True)
    vote_score = serializers.SerializerMethodField()
    upvote_count = serializers.SerializerMethodField()
    downvote_count = serializers.SerializerMethodField()
    time_since = serializers.SerializerMethodField()
    
    class Meta:
        model = Question
        fields = ['id', 'title', 'content', 'category', 'tags', 'author', 'image', 'vote_score', 'upvote_count', 'downvote_count', 'answers', 'time_since', 'created_at', 'updated_at']
    
    def get_vote_score(self, obj):
        return obj.vote_score()
    
    def get_upvote_count(self, obj):
        return obj.upvotes.count()
    
    def get_downvote_count(self, obj):
        return obj.downvotes.count()
    
    def get_time_since(self, obj):
        return obj.time_since()

class QuestionCreateSerializer(serializers.ModelSerializer):
    tags = serializers.ListField(child=serializers.CharField(), required=False, write_only=True)
    
    class Meta:
        model = Question
        fields = ['title', 'content', 'category', 'tags', 'image']
    
    def create(self, validated_data):
        tags_data = validated_data.pop('tags', [])
        question = Question.objects.create(**validated_data)
        for tag_name in tags_data:
            tag, _ = Tag.objects.get_or_create(name=tag_name.strip())
            question.tags.add(tag)
        return question
    
    def to_representation(self, instance):
        return QuestionListSerializer(instance, context=self.context).data

class UserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.CharField(source='user.email', read_only=True)
    date_joined = serializers.DateTimeField(source='user.date_joined', read_only=True)
    question_count = serializers.SerializerMethodField()
    answer_count = serializers.SerializerMethodField()
    
    
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'reputation', 'bio', 'date_joined', 'question_count', 'answer_count', 'banner_image']
    
    def get_question_count(self, obj):
        return Question.objects.filter(author=obj.user).count()
    
    def get_answer_count(self, obj):
        return Answer.objects.filter(author=obj.user).count()


class AnnouncementSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    tag_display = serializers.CharField(source='get_tag_display', read_only=True)

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'tag', 'tag_display', 'author',
                  'is_pinned', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']