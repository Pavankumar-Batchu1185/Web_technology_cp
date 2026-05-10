from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from qa.models import UserProfile

class Command(BaseCommand):
    help = 'Create user profiles for existing users'

    def handle(self, *args, **kwargs):
        for user in User.objects.all():
            profile, created = UserProfile.objects.get_or_create(user=user)
            if created:
                self.stdout.write(f'Created profile for {user.username}')
            else:
                self.stdout.write(f'Profile already exists for {user.username}')
        
        self.stdout.write(self.style.SUCCESS('Successfully created user profiles'))
