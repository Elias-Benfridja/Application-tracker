from django.urls import path
from .views import ApplicationView, ApplicationRetrieveView

urlpatterns = [
    path('', ApplicationView.as_view(), name = 'application'),
    path('<int:pk>/', ApplicationRetrieveView.as_view(), name = 'retrieve_application')
]
