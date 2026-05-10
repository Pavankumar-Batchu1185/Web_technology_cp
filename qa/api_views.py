from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.contrib.auth.models import User
from django.db.models import Q, Count, F
from .models import Category, Tag, Question, Answer, UserProfile
from .serializers import (
    CategorySerializer, TagSerializer, QuestionListSerializer,
    QuestionDetailSerializer, QuestionCreateSerializer, AnswerSerializer,
    UserProfileSerializer, UserSerializer
)

from rest_framework.parsers import MultiPartParser, FormParser

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class TagViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer

class QuestionViewSet(viewsets.ModelViewSet):
    queryset = Question.objects.annotate(answer_count=Count('answers', distinct=True))
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'content']
    ordering_fields = ['created_at', 'answer_count']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return QuestionDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return QuestionCreateSerializer
        return QuestionListSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get('category')
        tag = self.request.query_params.get('tag')
        sort = self.request.query_params.get('sort', 'newest')

        if category:
            queryset = queryset.filter(category_id=category)
        if tag:
            queryset = queryset.filter(tags__id=tag)

        if sort == 'answers':
            queryset = queryset.order_by('-answer_count')
        elif sort == 'votes':
            queryset = queryset.annotate(
                _upvote_count=Count('upvotes', distinct=True),
                _downvote_count=Count('downvotes', distinct=True)
            ).annotate(
                _vote_score=F('_upvote_count') - F('_downvote_count')
            ).order_by('-_vote_score')
        elif sort == 'oldest':
            queryset = queryset.order_by('created_at')
        else:
            queryset = queryset.order_by('-created_at')

        return queryset

    def perform_create(self, serializer):
        question = serializer.save(author=self.request.user)
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        profile.reputation += 5
        profile.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upvote(self, request, pk=None):
        question = self.get_object()
        if request.user in question.upvotes.all():
            question.upvotes.remove(request.user)
        else:
            question.upvotes.add(request.user)
            question.downvotes.remove(request.user)
            profile, _ = UserProfile.objects.get_or_create(user=question.author)
            profile.reputation += 1
            profile.save()
        return Response({
            'vote_score': question.vote_score(),
            'upvote_count': question.upvotes.count(),
            'downvote_count': question.downvotes.count()
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def downvote(self, request, pk=None):
        question = self.get_object()
        if request.user in question.downvotes.all():
            question.downvotes.remove(request.user)
        else:
            question.downvotes.add(request.user)
            question.upvotes.remove(request.user)
        return Response({
            'vote_score': question.vote_score(),
            'upvote_count': question.upvotes.count(),
            'downvote_count': question.downvotes.count()
        })

class AnswerViewSet(viewsets.ModelViewSet):
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = super().get_queryset()
        question_id = self.request.query_params.get('question')
        author = self.request.query_params.get('author')
        if question_id:
            queryset = queryset.filter(question_id=question_id)
        if author:
            queryset = queryset.filter(author__username=author)
        return queryset

    def perform_create(self, serializer):
        answer = serializer.save(author=self.request.user)
        profile, _ = UserProfile.objects.get_or_create(user=self.request.user)
        profile.reputation += 3
        profile.save()

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def upvote(self, request, pk=None):
        answer = self.get_object()
        if request.user in answer.upvotes.all():
            answer.upvotes.remove(request.user)
        else:
            answer.upvotes.add(request.user)
            answer.downvotes.remove(request.user)
            profile, _ = UserProfile.objects.get_or_create(user=answer.author)
            profile.reputation += 1
            profile.save()
        return Response({
            'vote_score': answer.vote_score(),
            'upvote_count': answer.upvotes.count(),
            'downvote_count': answer.downvotes.count()
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def downvote(self, request, pk=None):
        answer = self.get_object()
        if request.user in answer.downvotes.all():
            answer.downvotes.remove(request.user)
        else:
            answer.downvotes.add(request.user)
            answer.upvotes.remove(request.user)
        return Response({
            'vote_score': answer.vote_score(),
            'upvote_count': answer.upvotes.count(),
            'downvote_count': answer.downvotes.count()
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_best(self, request, pk=None):
        answer = self.get_object()
        if request.user != answer.question.author:
            return Response({'error': 'Only question author can mark best answer'}, status=status.HTTP_403_FORBIDDEN)

        Answer.objects.filter(question=answer.question).update(is_best=False)
        answer.is_best = True
        answer.save()

        profile, _ = UserProfile.objects.get_or_create(user=answer.author)
        profile.reputation += 10
        profile.save()

        return Response({'message': 'Best answer marked'})

class UserProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    lookup_field = 'user__username'
    lookup_url_kwarg = 'user__username'
    parser_classes = [MultiPartParser, FormParser]

    def get_object(self):
        username = self.kwargs.get('user__username') or self.kwargs.get('pk')
        return UserProfile.objects.get(user__username=username)

    @action(detail=False, methods=['get', 'put'], permission_classes=[IsAuthenticated])
    def me(self, request):
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        if request.method == 'PUT':
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer = UserProfileSerializer(profile)
        return Response(serializer.data)
