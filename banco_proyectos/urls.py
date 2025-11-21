from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    # ViewSet (nuevo)
    FormularioProyectoViewSet,
    
    # Vistas de aplicaciones (alumnos)
    AplicarProyectoView,
    MisAplicacionesView,
    SolicitudesAceptadasAlumnoView,
    ConfirmarProyectoAlumnoView,
    ProyectoAceptadoAlumnoView,
    
    # Vistas de gestión (empresas)
    AplicacionesPorProyectoView,
    ActualizarEstadoAplicacionView,
    AplicacionesPorEmpresaView,
    ResidentesAprobadosEmpresaView,
)

from . import reportes_views 



# ✅ Router para el ViewSet de proyectos
router = DefaultRouter()
router.register(r'formulario_proyecto', FormularioProyectoViewSet, basename='formulario_proyecto')


urlpatterns = [
    # ============================================
    # RUTAS DEL VIEWSET (CRUD + terminar + terminados)
    # ============================================
    # Estas rutas se generan automáticamente:
    # GET    /api/banco_proyectos/formulario_proyecto/          → list
    # POST   /api/banco_proyectos/formulario_proyecto/          → create
    # GET    /api/banco_proyectos/formulario_proyecto/{id}/     → retrieve
    # PUT    /api/banco_proyectos/formulario_proyecto/{id}/     → update
    # PATCH  /api/banco_proyectos/formulario_proyecto/{id}/     → partial_update
    # DELETE /api/banco_proyectos/formulario_proyecto/{id}/     → destroy
    # POST   /api/banco_proyectos/formulario_proyecto/{id}/terminar/   → terminar_proyecto
    # GET    /api/banco_proyectos/formulario_proyecto/terminados/      → proyectos_terminados
    path('', include(router.urls)),
    
    # ============================================
    # RUTAS DE APLICACIONES (ALUMNOS)
    # ============================================
    path('aplicar/', AplicarProyectoView.as_view(), name='aplicar-proyecto'),
    path('alumno/mis-aplicaciones/', MisAplicacionesView.as_view(), name='mis-aplicaciones'),
    path('alumno/solicitudes-aceptadas/', SolicitudesAceptadasAlumnoView.as_view(), name='solicitudes-aceptadas'),
    path('alumno/confirmar-proyecto/', ConfirmarProyectoAlumnoView.as_view(), name='confirmar-proyecto'),
    path('alumno/proyecto-aceptado/', ProyectoAceptadoAlumnoView.as_view(), name='proyecto-aceptado'),
    
    # ============================================
    # RUTAS DE GESTIÓN (EMPRESAS)
    # ============================================
    path('aplicacion/<int:pk>/', ActualizarEstadoAplicacionView.as_view(), name='actualizar-aplicacion'),
    path('empresa/proyecto/<int:proyecto_id>/aplicaciones/', AplicacionesPorProyectoView.as_view(), name='aplicaciones-proyecto'),
    path('empresa/aplicaciones/', AplicacionesPorEmpresaView.as_view(), name='aplicaciones-empresa'),
    path('empresa/aprobados/', ResidentesAprobadosEmpresaView.as_view(), name='residentes-aprobados'),

#  RUTAS DE REPORTES
    path('reportes/alumnos/', reportes_views.reporte_alumnos, name='reporte-alumnos'),
    path('reportes/proyectos/', reportes_views.reporte_proyectos, name='reporte-proyectos'),
    path('reportes/estadisticas/', reportes_views.reporte_estadisticas, name='reporte-estadisticas'),

]