from rest_framework import serializers
from .models import FormularioProyecto, AplicacionProyecto
from users.models import Usuario  # Ajusta el import según tu proyecto

class FormularioProyectoSerializer(serializers.ModelSerializer):
    modalidad_display = serializers.CharField(source='get_modalidad_display', read_only=True)
    tipo_entidad_display = serializers.CharField(source='get_tipo_entidad_display', read_only=True)
    giro_display = serializers.CharField(source='get_giro_display', read_only=True)
    periodo_display = serializers.CharField(source='get_periodo_display', read_only=True)
    apoyo_display = serializers.CharField(source='get_apoyo_display', read_only=True)
    es_tec_display = serializers.CharField(source='get_es_tec_display', read_only=True)

    class Meta:
        model = FormularioProyecto
        fields = '__all__'
        read_only_fields = ['empresa']  # <-- Esto es clave

class AlumnoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'telefono', 'especialidad', 'foto', 'email', 'nombres', 'primer_apellido','segundo_apellido']  # Agrega los campos que quieras mostrar

class ProyectoSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormularioProyecto
        fields = ['id', 'nombre_proyecto']  # Agrega otros campos si quieres

class AplicacionProyectoSerializer(serializers.ModelSerializer):
    alumno = AlumnoSerializer(read_only=True)
    proyecto = ProyectoSimpleSerializer(read_only=True)  # <-- Agrega esto

    class Meta:
        model = AplicacionProyecto
        fields = '__all__'
        read_only_fields = ['alumno', 'proyecto', 'fecha_aplicacion']