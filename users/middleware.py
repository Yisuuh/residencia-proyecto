from django.shortcuts import redirect
from django.urls import reverse
from django.http import HttpResponseForbidden

class RoleBasedAccessMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Verificar si el usuario está autenticado
        if request.user.is_authenticated:
            # Validar acceso según el rol y la ruta
            if request.path.startswith('/dashboard/alumno/') and request.user.role != 'alumno':
                return HttpResponseForbidden("No tienes permiso para acceder a esta página.")
            if request.path.startswith('/dashboard/jefe_carrera/') and request.user.role != 'jefe_carrera':
                return HttpResponseForbidden("No tienes permiso para acceder a esta página.")
            if request.path.startswith('/dashboard/coordinador/') and request.user.role != 'coordinador':
                return HttpResponseForbidden("No tienes permiso para acceder a esta página.")
            if request.path.startswith('/dashboard/admin/') and request.user.role != 'admin':
                return HttpResponseForbidden("No tienes permiso para acceder a esta página.")

        # Continuar con la solicitud si no hay restricciones
        response = self.get_response(request)
        return response