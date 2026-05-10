
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from .models import Achievement
from .serializers import AchievementSerializer, AchievementCreateSerializer

class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all()
    permission_classes = [IsAuthenticatedOrReadOnly]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return AchievementCreateSerializer
        return AchievementSerializer
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)
