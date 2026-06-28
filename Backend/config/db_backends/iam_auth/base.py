import boto3
from django.db.backends.postgresql import base

class DatabaseWrapper(base.DatabaseWrapper):
    def get_connection_params(self):
        params = super().get_connection_params()
        client = boto3.client('rds', region_name='eu-north-1')
        token = client.generate_db_auth_token(
            DBHostname=params['host'],
            Port=int(params['port']),
            DBUsername=params['user']
        )
        params['password'] = token
        params['sslmode'] = 'require'
        return params