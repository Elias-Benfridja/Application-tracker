from .base import *
import os
import dj_database_url

DEBUG = False
ALLOWED_HOSTS = ['application-tracker-production-3af2.up.railway.app']

CORS_ALLOW_ALL_ORIGINS = True

DATABASES = {
    'default': {
        'ENGINE': 'db_backends.iam_auth',
        'NAME': 'postgres',
        'USER': 'postgres',
        'HOST': 'visatrack-db.cluster-cfsgq0imo1d8.eu-north-1.rds.amazonaws.com',
        'PORT': '5432',
        'CONN_MAX_AGE': 0,
    }
}