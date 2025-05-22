from django.urls import path
from .views import (
    CustomTokenObtainPairView,
    UsuarioRegisterView,
    RoleBasedDashboardView,
    dashboard_alumno,
    dashboard_jefe_carrera,
    dashboard_coordinador,
    dashboard_admin,
    UserProfileView,
    CompletarPerfilView,
    EmpresaRegisterView,
    UsuarioListView,
    UsuarioDetailView,
)

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='custom_login'),
    path('register/', UsuarioRegisterView.as_view(), name='usuario_register'),
    path('register-empresa/', EmpresaRegisterView.as_view(), name='register-empresa'),
    path('dashboard/alumno/', dashboard_alumno, name='dashboard_alumno'),
    path('dashboard/jefe_carrera/', dashboard_jefe_carrera, name='dashboard_jefe_carrera'),
    path('dashboard/coordinador/', dashboard_coordinador, name='dashboard_coordinador'),
    path('dashboard/admin/', dashboard_admin, name='dashboard_admin'),
    path('dashboard/', RoleBasedDashboardView.as_view(), name='role_based_dashboard'),
    path('me/', UserProfileView.as_view(), name='user_profile'),
    path('completar-perfil/', CompletarPerfilView.as_view(), name='completar_perfil'),
    path('usuarios/', UsuarioListView.as_view(), name='usuarios_list'),
    path('usuarios/<int:id>/', UsuarioDetailView.as_view(), name='usuario_detail'),
]
