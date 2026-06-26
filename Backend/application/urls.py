from django.urls import path
from .views import ApplicationView, ApplicationRetrieveView, StatusRetrivePathView, ChatAdvisorView, GuideView, MyDocumentsView

urlpatterns = [
    path('', ApplicationView.as_view(), name = 'application'),
    path('documents/', MyDocumentsView.as_view(), name = 'my_documents'),
    path('<int:pk>/', ApplicationRetrieveView.as_view(), name = 'retrieve_application'),
    path('checklist/<int:pk>/', StatusRetrivePathView.as_view(), name = 'status'),
    path('<int:pk>/chat/', ChatAdvisorView.as_view(), name = 'chat_advisor'),
    path('<int:pk>/guide/', GuideView.as_view(), name = 'guide')
]