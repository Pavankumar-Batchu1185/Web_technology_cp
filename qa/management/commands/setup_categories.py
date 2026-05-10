from django.core.management.base import BaseCommand
from qa.models import Category

class Command(BaseCommand):
    help = 'Creates default categories for the Q&A system'

    def handle(self, *args, **kwargs):
        categories = [
            'Programming',
            'Web Development',
            'Data Science',
            'Mathematics',
            'Physics',
            'Chemistry',
            'Biology',
            'Computer Science',
            'Software Engineering',
            'Algorithms',
            'Database',
            'Networking',
            'Operating Systems',
            'Machine Learning',
            'Artificial Intelligence',
        ]

        created_count = 0
        existing_count = 0

        for cat_name in categories:
            category, created = Category.objects.get_or_create(name=cat_name)
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✓ Created: {cat_name}'))
            else:
                existing_count += 1
                self.stdout.write(self.style.WARNING(f'- Already exists: {cat_name}'))

        self.stdout.write(self.style.SUCCESS(f'\n✅ Done! Created {created_count} new categories, {existing_count} already existed.'))
