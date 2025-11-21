from rest_framework import serializers
from .models import Especialidad, Modalidad, TipoDocumento, PeriodoAcademico


class EspecialidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Especialidad
        fields = ['id', 'codigo', 'nombre', 'activa', 'orden', 'fecha_creacion']
        read_only_fields = ['fecha_creacion']


class ModalidadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Modalidad
        fields = ['id', 'codigo', 'nombre', 'descripcion', 'activa', 'orden', 'fecha_creacion']
        read_only_fields = ['fecha_creacion']


class TipoDocumentoSerializer(serializers.ModelSerializer):
    class Meta:
        model = TipoDocumento
        fields = ['id', 'nombre', 'descripcion', 'requerido', 'dias_plazo', 'activo', 'orden', 'fecha_creacion']
        read_only_fields = ['fecha_creacion']


class PeriodoAcademicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = PeriodoAcademico
        fields = ['id', 'nombre', 'fecha_inicio', 'fecha_fin', 'activo', 'fecha_creacion']
        read_only_fields = ['fecha_creacion']