#!/bin/bash

while !</dev/tcp/db/5432; do sleep 1; done;
sleep 2
python manage.py makemigrations
python manage.py migrate
gunicorn backend.wsgi --bind 0.0.0.0:80 --reload --threads=2 --workers=4 --keep-alive=120
