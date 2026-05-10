from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.core.paginator import Paginator
from .models import Achievement

def achievement_list(request):
    achievements = Achievement.objects.all()
    
    paginator = Paginator(achievements, 10)
    page = request.GET.get('page')
    achievements = paginator.get_page(page)
    
    return render(request, 'achievements/achievement_list.html', {'achievements': achievements})

@login_required
def post_achievement(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        description = request.POST.get('description')
        achievement_type = request.POST.get('achievement_type')
        date_achieved = request.POST.get('date_achieved')
        image = request.FILES.get('image')
        Achievement.objects.create(
            title=title,
            description=description,
            achievement_type=achievement_type,
            student=request.user,
            date_achieved=date_achieved,
            image=image
        )
        return redirect('achievement_list')
    return render(request, 'achievements/post_achievement.html', {'types': Achievement.ACHIEVEMENT_TYPES})

@login_required
def edit_achievement(request, pk):
    achievement = get_object_or_404(Achievement, pk=pk)
    if request.user != achievement.student:
        messages.error(request, "You can only edit your own achievements.")
        return redirect('achievement_list')
    
    if request.method == 'POST':
        achievement.title = request.POST.get('title')
        achievement.description = request.POST.get('description')
        achievement.achievement_type = request.POST.get('achievement_type')
        achievement.date_achieved = request.POST.get('date_achieved')
        if request.FILES.get('image'):
            achievement.image = request.FILES.get('image')
        achievement.save()
        messages.success(request, "Achievement updated successfully.")
        return redirect('achievement_list')
    
    return render(request, 'achievements/edit_achievement.html', {
        'achievement': achievement,
        'types': Achievement.ACHIEVEMENT_TYPES
    })

@login_required
def delete_achievement(request, pk):
    achievement = get_object_or_404(Achievement, pk=pk)
    if request.user != achievement.student:
        messages.error(request, "You can only delete your own achievements.")
        return redirect('achievement_list')
    achievement.delete()
    messages.success(request, "Achievement deleted successfully.")
    return redirect('achievement_list')
