from rest_framework.generics import ListCreateAPIView, RetrieveAPIView
from .serializers import ApplicationSerializer
from .models import Application
from rest_framework.permissions import IsAuthenticated
# Create your views here.

class ApplicationView(ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Application.objects.filter(user = self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user = self.request.user)
        
class ApplicationRetrieveView(RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Application.objects.filter(user = self.request.user)