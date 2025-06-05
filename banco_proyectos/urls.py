from django.urls import path
from .views import AplicarProyectoView, AplicacionesPorProyectoView, ActualizarEstadoAplicacionView, FormularioProyectoListCreateView, AplicacionesPorEmpresaView, ResidentesAprobadosEmpresaView, ProyectoAceptadoAlumnoView

urlpatterns = [
    path('aplicar/', AplicarProyectoView.as_view(), name='aplicar-proyecto'),
    path('empresa/proyecto/<int:proyecto_id>/aplicaciones/', AplicacionesPorProyectoView.as_view(), name='aplicaciones-por-proyecto'),
    path('aplicacion/<int:pk>/', ActualizarEstadoAplicacionView.as_view(), name='actualizar-aplicacion'),
    path('formulario_proyecto/', FormularioProyectoListCreateView.as_view()),
    path('empresa/aplicaciones/', AplicacionesPorEmpresaView.as_view(), name='aplicaciones-por-empresa'),
    path('empresa/aprobados/', ResidentesAprobadosEmpresaView.as_view(), name='residentes-aprobados-empresa'),
path('alumno/proyecto-aceptado/', ProyectoAceptadoAlumnoView.as_view(), name='proyecto-aceptado-alumno'),
]
