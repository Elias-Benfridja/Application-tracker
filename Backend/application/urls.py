from django.urls import path
from .views import ApplicationView, ApplicationRetrieveView, StatusRetrivePathView, ChatAdvisorView

urlpatterns = [
    path('', ApplicationView.as_view(), name = 'application'),
    path('<int:pk>/', ApplicationRetrieveView.as_view(), name = 'retrieve_application'),
    path('checklist/<int:pk>/', StatusRetrivePathView.as_view(), name = 'status'),
    path('<int:pk>/chat/', ChatAdvisorView.as_view(), name = 'chat_advisor')
]
