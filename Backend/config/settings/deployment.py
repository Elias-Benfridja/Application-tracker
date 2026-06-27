from .base import *
import os
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = ['application-tracker-production-3af2.up.railway.app']

CORS_ALLOW_ALL_ORIGINS = True

DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL'),
        engine='django.db.backends.postgresql'
    )
}