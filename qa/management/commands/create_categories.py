from django.core.management.base import BaseCommand
from qa.models import Category

class Command(BaseCommand):
    help = 'Create initial categories'

    def handle(self, *args, **kwargs):
        categories = [
            'Programming',
            'Mathematics',
            'Science',
            'Engineering',
            'Literature',
            'General',
        ]
        
        for cat_name in categories:
            Category.objects.get_or_create(name=cat_name)
            self.stdout.write(f'Created category: {cat_name}')
        
        self.stdout.write(self.style.SUCCESS('Successfully created categories'))
