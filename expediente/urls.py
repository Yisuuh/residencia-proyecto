from django.urls import path
from .views import DocumentoView, DocumentosPredefinidosView, ExpedientesAlumnosView

urlpatterns = [
    path('documentos/', DocumentoView.as_view(), name='documentos'),
    path('documentos/<int:pk>/', DocumentoView.as_view(), name='documento_detalle'),
    path('documentos_predefinidos/', DocumentosPredefinidosView.as_view(), name='documentos_predefinidos'),
    path('expedientes_alumnos/', ExpedientesAlumnosView.as_view(), name='expedientes_alumnos'),
]