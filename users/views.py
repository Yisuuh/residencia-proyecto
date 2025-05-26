from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import HttpResponseForbidden
from rest_framework import generics
from .models import Usuario
from .serializers import UsuarioRegisterSerializer, EmpresaRegisterSerializer, UsuarioSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UsuarioRegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioRegisterSerializer

    def create(self, request, *args, **kwargs):
        # Crear el usuario utilizando el serializador
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        # Generar tokens JWT para el usuario
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Responder con los datos del usuario y los tokens
        return Response(
            {
                "user": {
                    "email": user.email,
                    "nombres": user.nombres,
                    "primer_apellido": user.primer_apellido,
                    "segundo_apellido": user.segundo_apellido,
                },
                "access": access_token,
                "refresh": refresh_token,
            },
            status=status.HTTP_201_CREATED,
        )

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"message": "Bienvenido al dashboard"})

class RoleBasedDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Determina la ruta del dashboard según el rol del usuario
        if request.user.role == 'alumno':
            return Response({"dashboard_url": "/dashboard/alumno/"})
        elif request.user.role == 'jefe_carrera':
            return Response({"dashboard_url": "/dashboard/jefe_carrera/"})
        elif request.user.role == 'coordinador':
            return Response({"dashboard_url": "/dashboard/coordinador/"})
        elif request.user.role == 'admin':
            return Response({"dashboard_url": "/dashboard/admin/"})
        else:
            return Response({"error": "Rol no reconocido"}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_alumno(request):
    if request.user.role != 'alumno':
        return Response({"error": "No tienes permiso para acceder a este dashboard"}, status=403)
    return Response({"message": "Bienvenido al dashboard del alumno"})

@login_required
def dashboard_jefe_carrera(request):
    if request.user.role != 'jefe_carrera':
        return HttpResponseForbidden("No tienes permiso para acceder a esta página.")
    return render(request, 'dashboard_jefe_carrera.html')

@login_required
def dashboard_coordinador(request):
    if request.user.role != 'coordinador':
        return HttpResponseForbidden("No tienes permiso para acceder a esta página.")
    return render(request, 'dashboard_coordinador.html')

@login_required
def dashboard_admin(request):
    if request.user.role != 'admin':
        return HttpResponseForbidden("No tienes permiso para acceder a esta página.")
    return render(request, 'dashboard_admin.html')

class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "name": f"{user.nombres} {user.primer_apellido} {user.segundo_apellido}",
            "role": user.role,
            "email": user.email,
            "is_profile_complete": user.is_profile_complete,  # Incluye el estado del perfil
            "photo": request.build_absolute_uri(user.foto.url) if user.foto else None,  # Construye la URL completa
        })

class CompletarPerfilView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user

        # Verifica si el perfil ya está completo
        if user.is_profile_complete:
            return Response({"error": "El perfil ya está completo."}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data
        user.matricula = data.get("matricula", user.matricula)
        user.especialidad = data.get("especialidad", user.especialidad)
        user.ingreso = data.get("ingreso", user.ingreso)
        user.telefono = data.get("telefono", user.telefono)

        if 'foto' in request.FILES:
            user.foto = request.FILES['foto']

        user.is_profile_complete = True  # Marca la cuenta como completa
        user.save()

        return Response({"message": "Perfil completado con éxito"}, status=status.HTTP_200_OK)

class EmpresaRegisterView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = EmpresaRegisterSerializer

class UsuarioListView(generics.ListAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer  # O uno solo de lectura
    permission_classes = [IsAuthenticated]  # O permisos más restrictivos

class UsuarioDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "id"
