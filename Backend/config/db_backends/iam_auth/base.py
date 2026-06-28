import boto3
import logging
from django.db.backends.postgresql import base

logger = logging.getLogger(__name__)

class DatabaseWrapper(base.DatabaseWrapper):
    def get_connection_params(self):
        params = super().get_connection_params()
        try:
            client = boto3.client('rds', region_name='eu-north-1')
            token = client.generate_db_auth_token(
                DBHostname=params['host'],
                Port=int(params['port']),
                DBUsername=params['user']
            )
            params['password'] = token
            params['sslmode'] = 'require'
            logger.info(f"IAM token generated for {params['user']}@{params['host']}")
        except Exception as e:
            logger.error(f"Failed to generate IAM token: {e}")
            raise
        return params