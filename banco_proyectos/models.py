from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator

User = get_user_model()

class FormularioProyecto(models.Model):
    # Datos generales
    empresa = models.ForeignKey(User, on_delete=models.CASCADE, related_name="proyectos")
    nombre_responsable = models.CharField(max_length=255)
    correo = models.EmailField()
    telefono = models.CharField(max_length=15)
    nombre_proyecto = models.CharField(max_length=500)
    objetivo = models.TextField()
    justificacion = models.TextField()
    problema = models.TextField()

    MODALIDADES = [
        ('virtual', 'Virtual'),
        ('hibrido', 'Híbrido'),
        ('presencial', 'Presencial'),
    ]
    modalidad = models.CharField(max_length=15, choices=MODALIDADES)

    TIPO_ENTIDAD = [
        ('empresa', 'Empresa'),
        ('institucion', 'Institución'),
    ]
    tipo_entidad = models.CharField(max_length=20, choices=TIPO_ENTIDAD)

    # Campos compartidos (para ambos tipos)
    nombre_institucion = models.CharField(max_length=255, blank=True, null=True)
    nombre_empresa = models.CharField(max_length=255, blank=True, null=True)
    rfc = models.CharField(max_length=13, blank=True, null=True)
    GIROS = [
        ('diseño', 'Diseño'),
        ('manufactura', 'Manufactura'),
        ('mantenimiento', 'Mantenimiento'),
        ('automatizacion', 'Automatización'),
        ('energias', 'Energías Renovables'),
        ('aire_acond', 'Aire acondicionado y refrigeración'),
        ('mecanica_auto', 'Mecánica Automotriz'),
        ('investigacion', 'Investigación'),
        ('otro', 'Otro'),
    ]
    giro = models.CharField(max_length=20, choices=GIROS, blank=True, null=True)
    pagina_web = models.URLField(blank=True, null=True)
    
    # ✅ CAMBIO 1: Expandir a 10 estudiantes
    ESTUDIANTES = [
        (1, '1'), (2, '2'), (3, '3'), (4, '4'), (5, '5'),
        (6, '6'), (7, '7'), (8, '8'), (9, '9'), (10, '10'),
    ]
    # ✅ CAMBIO 2: Agregar validadores para asegurar que sea número entre 1 y 10
    numero_estudiantes = models.IntegerField(
        choices=ESTUDIANTES, 
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        default=1,
        blank=True, 
        null=True
    )
    
    PERIODOS = [
        ('enero-junio', 'Enero - Junio'),
        ('agosto-diciembre', 'Agosto - Diciembre'),
    ]
    periodo = models.CharField(max_length=30, choices=PERIODOS, blank=True, null=True)
    SI_NO_CHOICES = [
        ('si', 'Sí'),
        ('no', 'No'),
    ]
    apoyo = models.CharField(max_length=3, choices=SI_NO_CHOICES, blank=True, null=True)

    tipo_apoyo = models.TextField(blank=True, null=True)

 # ✅ NUEVO: Estado del proyecto
    ESTADO_CHOICES = [
        ('activo', 'Activo'),
        ('terminado', 'Terminado'),
    ]
    
    estado = models.CharField(
        max_length=20,
        choices=ESTADO_CHOICES,
        default='activo',
        verbose_name="Estado del Proyecto"
    )
    
    fecha_terminado = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name="Fecha de Terminación"
    )

    # ✅ NUEVO CAMPO: Especialidad requerida
    ESPECIALIDADES = [
        ('sistemas', 'Sistemas Computacionales'),
        ('industrial', 'Ingeniería Industrial'),
        ('gestion', 'Ingeniería en Gestión Empresarial'),
        ('mecanica', 'Ingeniería Mecánica'),
        ('mecatronica', 'Ingeniería Mecatrónica'),
        ('electronica', 'Ingeniería Electrónica'),
        ('electrica', 'Ingeniería Eléctrica'),
        ('civil', 'Ingeniería Civil'),
    ]
    especialidad = models.CharField(
        max_length=20, 
        choices=ESPECIALIDADES, 
        blank=True, 
        null=True,
        verbose_name="Especialidad requerida"
    )

    estudiante_interesado = models.CharField(max_length=3, choices=SI_NO_CHOICES, blank=True, null=True)
    nombre_estudiante_solicitado = models.CharField(max_length=255, blank=True, null=True)
    es_tec = models.CharField(max_length=3, choices=SI_NO_CHOICES, blank=True, null=True)

    observaciones = models.TextField(blank=True, null=True)
    imagen = models.ImageField(upload_to='proyectos_imagenes/', null=True, blank=True)
    fecha_subida = models.DateField(blank=True, null=True)

    def __str__(self):
        return f"{self.nombre_proyecto} - {self.nombre_empresa} ({self.get_estado_display()})"

    def terminar_proyecto(self):
            """Marca el proyecto como terminado"""
            from django.utils import timezone
            self.estado = 'terminado'
            self.fecha_terminado = timezone.now()
            self.save()

    class Meta:
        verbose_name = "Proyecto"
        verbose_name_plural = "Proyectos"
        ordering = ['-fecha_subida']

class AplicacionProyecto(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aceptado_por_empresa', 'Aceptado por Empresa'),  # ✅ NUEVO ESTADO
        ('aceptado', 'Aceptado'),
        ('rechazado', 'Rechazado'),
    ]
    
    alumno = models.ForeignKey(User, on_delete=models.CASCADE, related_name="aplicaciones")
    proyecto = models.ForeignKey('FormularioProyecto', on_delete=models.CASCADE, related_name="aplicaciones")
    estado = models.CharField(max_length=30, choices=ESTADOS, default='pendiente')  # ✅ Aumentar max_length
    fecha_aplicacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.alumno.email} -> {self.proyecto.nombre_proyecto} ({self.estado})"

    class Meta:
        verbose_name = "Aplicación a Proyecto"
        verbose_name_plural = "Aplicaciones a Proyectos"
        ordering = ['-fecha_aplicacion']
        unique_together = ['alumno', 'proyecto']