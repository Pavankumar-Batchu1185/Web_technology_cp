from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth import login
from django.contrib import messages
from django.db.models import Q, Count
from django.core.paginator import Paginator
from .models import Question, Answer, Category, Tag, UserProfile
from django.contrib.auth import logout
from django.views.decorators.http import require_POST

def question_list(request):
    questions = Question.objects.annotate(answer_count=Count('answers'))
    
    category_id = request.GET.get('category')
    tag_id = request.GET.get('tag')
    search = request.GET.get('search')
    sort = request.GET.get('sort', 'newest')
    
    if category_id:
        questions = questions.filter(category_id=category_id)
    if tag_id:
        questions = questions.filter(tags__id=tag_id)
    if search:
        questions = questions.filter(Q(title__icontains=search) | Q(content__icontains=search))
    
    if sort == 'votes':
        questions = sorted(questions, key=lambda q: q.vote_score(), reverse=True)
    elif sort == 'answers':
        questions = questions.order_by('-answer_count')
    else:
        questions = questions.order_by('-created_at')
    
    paginator = Paginator(questions, 10)
    page = request.GET.get('page')
    questions = paginator.get_page(page)
    
    categories = Category.objects.all()
    tags = Tag.objects.all()
    return render(request, 'qa/question_list.html', {
        'questions': questions, 
        'categories': categories, 
        'tags': tags,
        'current_sort': sort
    })

def question_detail(request, pk):
    question = get_object_or_404(Question, pk=pk)
    return render(request, 'qa/question_detail.html', {'question': question})

@login_required
def post_question(request):
    if request.method == 'POST':
        title = request.POST.get('title')
        content = request.POST.get('content')
        category_id = request.POST.get('category')
        image = request.FILES.get('image')
        tags = request.POST.get('tags', '').split(',')
        
        category = Category.objects.get(pk=category_id)
        question = Question.objects.create(title=title, content=content, category=category, author=request.user, image=image)
        
        for tag_name in tags:
            tag_name = tag_name.strip()
            if tag_name:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                question.tags.add(tag)
        
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.reputation += 5
        profile.save()
        
        return redirect('question_list')
    categories = Category.objects.all()
    return render(request, 'qa/post_question.html', {'categories': categories})

@login_required
def edit_question(request, pk):
    question = get_object_or_404(Question, pk=pk)
    if request.user != question.author:
        messages.error(request, "You can only edit your own questions.")
        return redirect('question_detail', pk=pk)
    
    if request.method == 'POST':
        question.title = request.POST.get('title')
        question.content = request.POST.get('content')
        question.category_id = request.POST.get('category')
        if request.FILES.get('image'):
            question.image = request.FILES.get('image')
        question.save()
        
        question.tags.clear()
        tags = request.POST.get('tags', '').split(',')
        for tag_name in tags:
            tag_name = tag_name.strip()
            if tag_name:
                tag, _ = Tag.objects.get_or_create(name=tag_name)
                question.tags.add(tag)
        
        messages.success(request, "Question updated successfully.")
        return redirect('question_detail', pk=pk)
    
    categories = Category.objects.all()
    tag_names = ','.join([tag.name for tag in question.tags.all()])
    return render(request, 'qa/edit_question.html', {
        'question': question, 
        'categories': categories,
        'tag_names': tag_names
    })

@login_required
def delete_question(request, pk):
    question = get_object_or_404(Question, pk=pk)
    if request.user != question.author:
        messages.error(request, "You can only delete your own questions.")
        return redirect('question_detail', pk=pk)
    question.delete()
    messages.success(request, "Question deleted successfully.")
    return redirect('question_list')

@login_required
def post_answer(request, pk):
    if request.method == 'POST':
        question = get_object_or_404(Question, pk=pk)
        content = request.POST.get('content')
        Answer.objects.create(question=question, content=content, author=request.user)
        
        profile, _ = UserProfile.objects.get_or_create(user=request.user)
        profile.reputation += 3
        profile.save()
        
        return redirect('question_detail', pk=pk)

@login_required
def edit_answer(request, pk):
    answer = get_object_or_404(Answer, pk=pk)
    if request.user != answer.author:
        messages.error(request, "You can only edit your own answers.")
        return redirect('question_detail', pk=answer.question.pk)
    
    if request.method == 'POST':
        answer.content = request.POST.get('content')
        answer.save()
        messages.success(request, "Answer updated successfully.")
        return redirect('question_detail', pk=answer.question.pk)
    
    return render(request, 'qa/edit_answer.html', {'answer': answer})

@login_required
def delete_answer(request, pk):
    answer = get_object_or_404(Answer, pk=pk)
    question_pk = answer.question.pk
    if request.user != answer.author:
        messages.error(request, "You can only delete your own answers.")
        return redirect('question_detail', pk=question_pk)
    answer.delete()
    messages.success(request, "Answer deleted successfully.")
    return redirect('question_detail', pk=question_pk)

@login_required
def vote_question(request, pk, vote_type):
    question = get_object_or_404(Question, pk=pk)
    
    if vote_type == 'up':
        if request.user in question.upvotes.all():
            question.upvotes.remove(request.user)
        else:
            question.upvotes.add(request.user)
            question.downvotes.remove(request.user)
            profile, _ = UserProfile.objects.get_or_create(user=question.author)
            profile.reputation += 1
            profile.save()
    else:
        if request.user in question.downvotes.all():
            question.downvotes.remove(request.user)
        else:
            question.downvotes.add(request.user)
            question.upvotes.remove(request.user)
    
    return redirect('question_detail', pk=pk)

@login_required
def vote_answer(request, pk, vote_type):
    answer = get_object_or_404(Answer, pk=pk)
    
    if vote_type == 'up':
        if request.user in answer.upvotes.all():
            answer.upvotes.remove(request.user)
        else:
            answer.upvotes.add(request.user)
            answer.downvotes.remove(request.user)
            profile, _ = UserProfile.objects.get_or_create(user=answer.author)
            profile.reputation += 1
            profile.save()
    else:
        if request.user in answer.downvotes.all():
            answer.downvotes.remove(request.user)
        else:
            answer.downvotes.add(request.user)
            answer.upvotes.remove(request.user)
    
    return redirect('question_detail', pk=answer.question.pk)

@login_required
def mark_best_answer(request, pk):
    answer = get_object_or_404(Answer, pk=pk)
    if request.user != answer.question.author:
        messages.error(request, "Only the question author can mark best answer.")
        return redirect('question_detail', pk=answer.question.pk)
    
    Answer.objects.filter(question=answer.question).update(is_best=False)
    answer.is_best = True
    answer.save()
    
    profile, _ = UserProfile.objects.get_or_create(user=answer.author)
    profile.reputation += 10
    profile.save()
    
    messages.success(request, "Best answer marked.")
    return redirect('question_detail', pk=answer.question.pk)

def user_profile(request, username):
    user = get_object_or_404(User, username=username)
    profile, _ = UserProfile.objects.get_or_create(user=user)
    questions = Question.objects.filter(author=user)
    answers = Answer.objects.filter(author=user)
    return render(request, 'qa/user_profile.html', {
        'profile_user': user,
        'profile': profile,
        'questions': questions,
        'answers': answers
    })

@login_required
def edit_profile(request):
    profile, _ = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        profile.bio = request.POST.get('bio')
        profile.save()
        messages.success(request, "Profile updated successfully.")
        return redirect('user_profile', username=request.user.username)
    return render(request, 'qa/edit_profile.html', {'profile': profile})

def register(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        password2 = request.POST.get('password2')
        
        if password != password2:
            messages.error(request, "Passwords don't match.")
            return redirect('register')
        
        if User.objects.filter(username=username).exists():
            messages.error(request, "Username already exists.")
            return redirect('register')
        
        user = User.objects.create_user(username=username, email=email, password=password)
        UserProfile.objects.get_or_create(user=user)
        login(request, user)
        messages.success(request, "Registration successful!")
        return redirect('question_list')
    
    return render(request, 'registration/register.html')

@login_required
def logout_view(request):
    logout(request)
    messages.success(request, "Logged out successfully.")
    return redirect('login')