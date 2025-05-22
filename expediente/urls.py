from django.urls import path
from .views import DocumentoView, DocumentosPredefinidosView

urlpatterns = [
    path('documentos/', DocumentoView.as_view(), name='documentos'),
    path('documentos/<int:pk>/', DocumentoView.as_view(), name='documento_detalle'),
    path('documentos_predefinidos/', DocumentosPredefinidosView.as_view(), name='documentos_predefinidos'),
]