from .base import *
import os
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = ['app-url']

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        engine='django.db.backends.postgresql'
    )
}