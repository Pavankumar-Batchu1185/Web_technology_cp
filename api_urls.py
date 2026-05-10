
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.views import StaffTokenObtainPairView
from qa.api_views import CategoryViewSet, TagViewSet, QuestionViewSet, AnswerViewSet, UserProfileViewSet, AnnouncementViewSet
from achievements.api_views import AchievementViewSet
from qa.auth_views import RegisterView, MeView

router = DefaultRouter()
router.register(r'categories', CategoryViewSet)
router.register(r'tags', TagViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'answers', AnswerViewSet)
router.register(r'achievements', AchievementViewSet)
router.register(r'announcements', AnnouncementViewSet)
router.register(r'profiles', UserProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('token/', StaffTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register/', RegisterView.as_view(), name='register'),
    path('auth/me/', MeView.as_view(), name='me'),
]
