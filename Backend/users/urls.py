from django.urls import path
from .views import RegisterView, Meview, ProfileView

urlpatterns = [
    path('register/', RegisterView.as_view(), name = 'register'),
    path('me/', Meview.as_view(), name = 'me'),
    path('upgrade/', ProfileView.as_view(), name = 'update')
]
