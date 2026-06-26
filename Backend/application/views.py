from rest_framework.generics import ListCreateAPIView, RetrieveAPIView, RetrieveUpdateAPIView, ListAPIView
from rest_framework.views import APIView, Response
from .serializers import ApplicationSerializer, ChecklistSerializer,MyDocumentSerializer
from .models import Application, Document, ApplicationDocumentation
from rest_framework.permissions import IsAuthenticated
from .services import generate_document_checklist, get_advisor_answer, get_guide_answer
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied
# Create your views here.

FREE_TIER_APP_LIMIT = 1

class ApplicationView(ListCreateAPIView):
    serializer_class = ApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Application.objects.filter(user = self.request.user)
    
    def perform_create(self, serializer):  
        if not self.request.user.profile.is_pro and self.request.user.application_set.count() >= FREE_TIER_APP_LIMIT:
            raise PermissionDenied("Free tier is limited to 1 application. Upgrade to add more.") 
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
    
class ChatAdvisorView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, pk):
        if not self.request.user.profile.is_pro:
            raise PermissionDenied("Chat with Advisor is a Pro feature. Upgrade to unlock it.")
        application = get_object_or_404(Application, user = self.request.user, pk = pk)
        response = get_advisor_answer(application,request.data["question"])
        return Response({"answer": response})
            
            
class GuideView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, pk):
        application = get_object_or_404(Application, user = self.request.user, pk = pk)
        response = get_guide_answer(application.country, application.purpose)
        return Response({"guide": response})
            
class MyDocumentsView(ListAPIView):
    serializer_class = MyDocumentSerializer
    permission_classes = [IsAuthenticated]
 
    def get_queryset(self):
        return ApplicationDocumentation.objects.filter(
            application__user = self.request.user
        ).exclude(attachment = '').select_related('document', 'application')
