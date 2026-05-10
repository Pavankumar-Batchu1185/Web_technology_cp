from django.urls import path
from . import views

urlpatterns = [
    path('', views.achievement_list, name='achievement_list'),
    path('post/', views.post_achievement, name='post_achievement'),
    path('<int:pk>/edit/', views.edit_achievement, name='edit_achievement'),
    path('<int:pk>/delete/', views.delete_achievement, name='delete_achievement'),
]
