from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.generics import CreateAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView, Response
from .serializers import UserSerializer
from django.contrib.auth.models import User

# Create your views here.
class RegisterView(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    
class Meview(RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        profile = request.user.profile
        profile.is_pro = True
        profile.save()
        return Response({"is_pro": True, "app_count": request.user.application_set.count()})