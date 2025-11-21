from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Especialidad, Modalidad, TipoDocumento, PeriodoAcademico
from .serializers import (
    EspecialidadSerializer, 
    ModalidadSerializer, 
    TipoDocumentoSerializer, 
    PeriodoAcademicoSerializer
)


class ConfiguracionPermission(IsAuthenticated):
    """Solo jefe_carrera puede modificar configuración"""
    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False
        # Solo lectura para todos, escritura solo para jefe_carrera
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        return request.user.role == 'jefe_carrera'


class EspecialidadViewSet(viewsets.ModelViewSet):
    queryset = Especialidad.objects.all()
    serializer_class = EspecialidadSerializer
    permission_classes = [ConfiguracionPermission]
    
    def get_queryset(self):
        # Mostrar solo activas por defecto, todas si admin
        if self.request.user.role == 'jefe_carrera':
            return Especialidad.objects.all()
        return Especialidad.objects.filter(activa=True)
    
    @action(detail=True, methods=['post'])
    def toggle_activa(self, request, pk=None):
        """Activar/desactivar especialidad"""
        especialidad = self.get_object()
        especialidad.activa = not especialidad.activa
        especialidad.save()
        return Response({'activa': especialidad.activa})


class ModalidadViewSet(viewsets.ModelViewSet):
    queryset = Modalidad.objects.all()
    serializer_class = ModalidadSerializer
    permission_classes = [ConfiguracionPermission]
    
    def get_queryset(self):
        if self.request.user.role == 'jefe_carrera':
            return Modalidad.objects.all()
        return Modalidad.objects.filter(activa=True)
    
    @action(detail=True, methods=['post'])
    def toggle_activa(self, request, pk=None):
        modalidad = self.get_object()
        modalidad.activa = not modalidad.activa
        modalidad.save()
        return Response({'activa': modalidad.activa})


class TipoDocumentoViewSet(viewsets.ModelViewSet):
    queryset = TipoDocumento.objects.all()
    serializer_class = TipoDocumentoSerializer
    permission_classes = [ConfiguracionPermission]
    
    def get_queryset(self):
        if self.request.user.role == 'jefe_carrera':
            return TipoDocumento.objects.all()
        return TipoDocumento.objects.filter(activo=True)
    
    @action(detail=True, methods=['post'])
    def toggle_activo(self, request, pk=None):
        tipo_doc = self.get_object()
        tipo_doc.activo = not tipo_doc.activo
        tipo_doc.save()
        return Response({'activo': tipo_doc.activo})


class PeriodoAcademicoViewSet(viewsets.ModelViewSet):
    queryset = PeriodoAcademico.objects.all()
    serializer_class = PeriodoAcademicoSerializer
    permission_classes = [ConfiguracionPermission]
    
    @action(detail=True, methods=['post'])
    def activar(self, request, pk=None):
        """Activar periodo (desactiva los demás)"""
        PeriodoAcademico.objects.update(activo=False)
        periodo = self.get_object()
        periodo.activo = True
        periodo.save()
        return Response({'success': True})