from django.shortcuts import get_object_or_404, render
from .serializers import QuestionSerializer, QuestionDetailSerializer, CommentSerializer
from rest_framework.permissions import IsAuthenticated 
from rest_framework.generics import ListCreateAPIView, CreateAPIView, RetrieveAPIView
from .models import Question

# Create your views here.

class QuestionListCreateView(ListCreateAPIView):
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Question.objects.all()
        country = self.request.query_params.get('country')
        purpose = self.request.query_params.get('purpose')
        if country:
            queryset = queryset.filter(country__iexact=country)
        if purpose:
            queryset = queryset.filter(purpose=purpose)
        return queryset

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class QuestionRetrieveView(RetrieveAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionDetailSerializer
    permission_classes = [IsAuthenticated]


class CommentCreateView(CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        question = get_object_or_404(Question, pk=self.kwargs['pk'])
        serializer.save(user=self.request.user, question=question)