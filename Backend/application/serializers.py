from rest_framework import serializers
from .models import Application, ApplicationDocumentation, Document

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ["name", "description", "details"]

class ApplicationDocumentationSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    class Meta:
        model = ApplicationDocumentation
        fields = ["id", "document", "status"]
        
class ApplicationSerializer(serializers.ModelSerializer):
    checklist = ApplicationDocumentationSerializer(many=True, read_only=True, source='applicationdocumentation_set')
    class Meta:
        model = Application
        fields = ["id", "country", "purpose", "deadline" ,"checklist"]
        
class ChecklistSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicationDocumentation
        fields = ["status"]