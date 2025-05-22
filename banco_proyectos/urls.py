from django.urls import path
from .views import FormularioProyectoListCreateView

urlpatterns = [
    path('formulario_proyecto/', FormularioProyectoListCreateView.as_view(), name='formulario-list-create'),
]
