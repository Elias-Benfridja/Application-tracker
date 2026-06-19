from rest_framework.generics import ListCreateAPIView, RetrieveAPIView, RetrieveUpdateAPIView
from .serializers import ApplicationSerializer, ChecklistSerializer
from .models import Application, Document, ApplicationDocumentation
from rest_framework.permissions import IsAuthenticated
from .services import generate_document_checklist
# Create your views here.

class ApplicationView(ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Application.objects.filter(user = self.request.user)
    
    def perform_create(self, serializer):
        application = serializer.save(user = self.request.user)
        documents = generate_document_checklist(country = application.country, purpose = application.purpose)
        for document in documents:
            document_data, created = Document.objects.get_or_create(
                name=document['name'],
                defaults={
                    'description': document['description'],
                    'details': document['details']
                }
            )
            ApplicationDocumentation.objects.create(
                application = application,
                document = document_data
            )
        
class ApplicationRetrieveView(RetrieveAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Application.objects.filter(user = self.request.user)
    
class StatusRetrivePathView(RetrieveUpdateAPIView):
    serializer_class = ChecklistSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return ApplicationDocumentation.objects.filter(application__user = self.request.user)
    