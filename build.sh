#!/usr/bin/env bash
set -o errexit
pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
python manage.py shell -c "from qa.models import Category; Category.objects.get_or_create(name='Programming'); Category.objects.get_or_create(name='Mathematics'); Category.objects.get_or_create(name='Science'); Category.objects.get_or_create(name='Web Development'); Category.objects.get_or_create(name='Data Science'); print('Categories created!')"
