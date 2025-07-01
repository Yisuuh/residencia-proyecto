from django.db import models
from django.contrib.auth import get_user_model


# Create your models here.

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
        ('aire_acond', 'Aiure acondicionado y refrigeración'),
        ('mecanica_auto', 'Mecanica Automotriz'),
        ('investigacion', 'Investigación'),
        ('otro', 'Otro'),
    ]
    giro = models.CharField(max_length=20, choices=GIROS, blank=True, null=True)
    pagina_web = models.URLField(blank=True, null=True)
    ESTUDIANTES = [
        (1, '1'),
        (2, '2'),
    ]
    numero_estudiantes = models.IntegerField(choices=ESTUDIANTES, blank=True, null=True)
    
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

    es_tec = models.CharField(max_length=3, choices=SI_NO_CHOICES, blank=True, null=True)

    observaciones = models.TextField(blank=True, null=True)
    imagen = models.ImageField(upload_to='proyectos_imagenes/', null=True, blank=True)
    fecha_subida = models.DateField( blank=True, null=True)

# models.py
class AplicacionProyecto(models.Model):
    alumno = models.ForeignKey(User, on_delete=models.CASCADE)
    proyecto = models.ForeignKey('FormularioProyecto', on_delete=models.CASCADE)
    estado = models.CharField(max_length=20, choices=[('pendiente', 'Pendiente'), ('aceptado', 'Aceptado'), ('rechazado', 'Rechazado')], default='pendiente')
    fecha_aplicacion = models.DateTimeField(auto_now_add=True)

