from rest_framework import serializers
from .models import FormularioProyecto, AplicacionProyecto
from users.models import Usuario  # Ajusta el import según tu proyecto

class FormularioProyectoSerializer(serializers.ModelSerializer):
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