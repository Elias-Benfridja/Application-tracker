import boto3
import os
from django.db.backends.postgresql import base

class DatabaseWrapper(base.DatabaseWrapper):
    def get_connection_params(self):
        params = super().get_connection_params()
        client = boto3.client(
            'rds',
            region_name='eu-north-1',
            aws_access_key_id=os.environ.get('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.environ.get('AWS_SECRET_ACCESS_KEY'),
        )
        token = client.generate_db_auth_token(
            DBHostname=params['host'],
            Port=int(params['port']),
            DBUsername=params['user']
        )
        params['password'] = token
        params['sslmode'] = 'require'
        return params