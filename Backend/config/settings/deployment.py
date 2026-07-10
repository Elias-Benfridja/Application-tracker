from .base import *
import os

DEBUG = False
ALLOWED_HOSTS = ['application-tracker-8h92.onrender.com']
CORS_ALLOW_ALL_ORIGINS = True

DATABASES = {
    'default': {
        'ENGINE': 'config.db_backends.iam_auth',
        'NAME': 'postgres',
        'USER': 'postgres',
        'HOST': 'visatrack-db.cluster-cfsgq0imo1d8.eu-north-1.rds.amazonaws.com',
        'PORT': '5432',
        'CONN_MAX_AGE': 0,
    }
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {'class': 'logging.StreamHandler'},
    },
    'root': {
        'handlers': ['console'],
        'level': 'DEBUG',
    },
}