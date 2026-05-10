import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_forum.settings')
django.setup()

from django.contrib.auth.models import User

print("Creating superuser...")
if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser('admin', 'admin@example.com', 'admin123')
    print("Superuser created: username='admin', password='admin123'")
else:
    print("Superuser already exists")

print("\nSetup complete!")
print("\nTo run the server: python manage.py runserver")
print("Admin panel: http://127.0.0.1:8000/admin/")
print("Login: username='admin', password='admin123'")
