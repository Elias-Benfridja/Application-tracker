from rest_framework import serializers
from .models import Comment, Question

class CommentSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'body', 'created_at']

class QuestionSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='user.username', read_only=True)
    comment_count = serializers.IntegerField(source='comments.count', read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'title', 'body', 'country', 'purpose', 'author', 'created_at', 'comment_count']

class QuestionDetailSerializer(serializers.ModelSerializer):
    author = serializers.CharField(source='user.username', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'title', 'body', 'country', 'purpose', 'author', 'created_at', 'comments']