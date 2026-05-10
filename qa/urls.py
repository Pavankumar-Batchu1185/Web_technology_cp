from django.urls import path
from . import views


urlpatterns = [
    path('', views.question_list, name='question_list'),
    path('question/<int:pk>/', views.question_detail, name='question_detail'),
    path('post/', views.post_question, name='post_question'),
    path('question/<int:pk>/edit/', views.edit_question, name='edit_question'),
    path('question/<int:pk>/delete/', views.delete_question, name='delete_question'),
    path('question/<int:pk>/answer/', views.post_answer, name='post_answer'),
    path('answer/<int:pk>/edit/', views.edit_answer, name='edit_answer'),
    path('answer/<int:pk>/delete/', views.delete_answer, name='delete_answer'),
    path('question/<int:pk>/vote/<str:vote_type>/', views.vote_question, name='vote_question'),
    path('answer/<int:pk>/vote/<str:vote_type>/', views.vote_answer, name='vote_answer'),
    path('answer/<int:pk>/best/', views.mark_best_answer, name='mark_best_answer'),
    path('user/<str:username>/', views.user_profile, name='user_profile'),
    path('profile/edit/', views.edit_profile, name='edit_profile'),
   # path('register/', views.register, name='register'),
   # path('logout/',views.logout_view,name='logout')
]