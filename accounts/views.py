from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer

class StaffTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer