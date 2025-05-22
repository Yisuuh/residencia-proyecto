from django.shortcuts import render
from rest_framework import generics
from .models import FormularioProyecto
from .serializer import FormularioProyectoSerializer

# Create your views here.

class FormularioProyectoListCreateView(generics.ListCreateAPIView):
    queryset = FormularioProyecto.objects.all()
    serializer_class = FormularioProyectoSerializer
