from django.urls import path
from .views import QuestionListCreateView, QuestionRetrieveView, CommentCreateView

urlpatterns = [
    path('', QuestionListCreateView.as_view(), name='questions'),
    path('<int:pk>/', QuestionRetrieveView.as_view(), name='question_detail'),
    path('<int:pk>/comments/', CommentCreateView.as_view(), name='add_comment'),
]