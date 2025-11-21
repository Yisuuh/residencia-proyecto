from rest_framework import serializers
from .models import FormularioProyecto, AplicacionProyecto
from users.models import Usuario

class FormularioProyectoSerializer(serializers.ModelSerializer):
    """Serializer para FormularioProyecto con campos calculados"""
    
    # Campos de choice con sus valores legibles
    modalidad_display = serializers.CharField(source='get_modalidad_display', read_only=True)
    tipo_entidad_display = serializers.CharField(source='get_tipo_entidad_display', read_only=True)
    giro_display = serializers.CharField(source='get_giro_display', read_only=True)
    periodo_display = serializers.CharField(source='get_periodo_display', read_only=True)
    apoyo_display = serializers.CharField(source='get_apoyo_display', read_only=True)
    es_tec_display = serializers.CharField(source='get_es_tec_display', read_only=True)
    especialidad_display = serializers.CharField(source='get_especialidad_display', read_only=True)
    
# ✅ NUEVO: Estado del proyecto
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)

    # ✅ CAMPOS CALCULADOS (contadores)
    estudiantes_aceptados = serializers.SerializerMethodField()
    total_aplicaciones = serializers.SerializerMethodField()
    aplicaciones_pendientes = serializers.SerializerMethodField()
    vacantes_disponibles = serializers.SerializerMethodField()
    imagen_empresa = serializers.SerializerMethodField()

    class Meta:
        model = FormularioProyecto
        fields = [
            'id',
            'nombre_responsable',
            'correo',
            'telefono',
            'nombre_proyecto',
            'objetivo',
            'justificacion',
            'problema',
            'modalidad',
            'modalidad_display',
            'tipo_entidad',
            'tipo_entidad_display',
            'nombre_empresa',
            'nombre_institucion',
            'rfc',
            'giro',
            'giro_display',
            'pagina_web',
            'numero_estudiantes',
            'periodo',
            'periodo_display',
            'apoyo',
            'apoyo_display',
            'tipo_apoyo',
            'especialidad',
            'especialidad_display',
            'estudiante_interesado',
            'nombre_estudiante_solicitado',
            'es_tec',
            'es_tec_display',
            'observaciones',
            'imagen',
            'imagen_empresa',
            'fecha_subida',
            # ✅ Campos calculados
            'estudiantes_aceptados',
            'total_aplicaciones',
            'aplicaciones_pendientes',
            'vacantes_disponibles',
            'estado_display',
            'estado',
            'fecha_terminado'
        ]
        read_only_fields = ['empresa', 'fecha_subida', 'fecha_terminado']

    def get_imagen_empresa(self, obj):
        """Retorna la URL completa de la imagen"""
        if obj.imagen:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.imagen.url)
            return obj.imagen.url
        return None

    def get_estudiantes_aceptados(self, obj):
        """Cuenta cuántos estudiantes han sido aceptados para este proyecto"""
        count = AplicacionProyecto.objects.filter(
            proyecto=obj,
            estado='aceptado'
        ).count()
        print(f"📊 Proyecto {obj.id} ({obj.nombre_proyecto}): {count} estudiantes aceptados")
        return count
    
    def get_total_aplicaciones(self, obj):
        """Cuenta el total de aplicaciones recibidas (todos los estados)"""
        count = AplicacionProyecto.objects.filter(proyecto=obj).count()
        return count
    
    def get_aplicaciones_pendientes(self, obj):
        """Cuenta cuántas aplicaciones están pendientes de revisión"""
        count = AplicacionProyecto.objects.filter(
            proyecto=obj,
            estado='pendiente'
        ).count()
        return count
    
    def get_vacantes_disponibles(self, obj):
        """Calcula cuántas vacantes quedan disponibles"""
        aceptados = self.get_estudiantes_aceptados(obj)
        
        # ✅ SOLUCIÓN: Asegurar que sea un entero válido
        try:
            # El campo ya es IntegerField, pero validamos por si acaso
            if obj.numero_estudiantes is None:
                num_estudiantes = 1
            elif isinstance(obj.numero_estudiantes, str):
                # Si por alguna razón es string, convertir
                num_estudiantes = int(obj.numero_estudiantes)
            else:
                num_estudiantes = int(obj.numero_estudiantes)
            
            # Validar rango
            if num_estudiantes < 1:
                num_estudiantes = 1
            elif num_estudiantes > 10:
                num_estudiantes = 10
                
        except (ValueError, TypeError) as e:
            print(f"⚠️ Error convirtiendo numero_estudiantes del proyecto {obj.id}: {obj.numero_estudiantes} - {e}")
            num_estudiantes = 1
        
        vacantes = num_estudiantes - aceptados
        
        print(f"📊 Proyecto {obj.id}: {aceptados}/{num_estudiantes} ocupadas, {vacantes} disponibles")
        print(f"   📌 Tipo: {type(obj.numero_estudiantes)}, Valor: {obj.numero_estudiantes}")
        
        return max(0, vacantes)  # No puede ser negativo


class AlumnoSerializer(serializers.ModelSerializer):
    """Serializer para datos básicos del alumno"""
    
    class Meta:
        model = Usuario
        fields = [
            'id', 
            'email', 
            'nombres', 
            'primer_apellido', 
            'segundo_apellido',
            'matricula',
            'telefono', 
            'especialidad', 
            'foto'
        ]

class AplicacionProyectoSerializer(serializers.ModelSerializer):
    """Serializer para las aplicaciones de alumnos a proyectos"""
    
    alumno = AlumnoSerializer(read_only=True)
    proyecto = FormularioProyectoSerializer(read_only=True)
    proyecto_id = serializers.IntegerField(write_only=True, required=False)
    estado_display = serializers.CharField(source='get_estado_display', read_only=True)
    
    class Meta:
        model = AplicacionProyecto
        fields = [
            'id',
            'alumno',
            'proyecto',
            'proyecto_id',
            'estado',
            'estado_display',
            'fecha_aplicacion',
            'fecha_actualizacion',
        ]
        read_only_fields = ['alumno', 'fecha_aplicacion', 'fecha_actualizacion']