from django.db import models


# Create your models here.

class FormularioProyecto(models.Model):
    # Datos generales
    nombre_responsable = models.CharField(max_length=255)
    correo = models.EmailField()
    telefono = models.CharField(max_length=15)
    nombre_proyecto = models.CharField(max_length=500)
    objetivo = models.TextField()
    justificacion = models.TextField()
    problema = models.TextField()
    actividades = models.TextField()
    stack = models.TextField()

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
    nombre_empresa = models.CharField(max_length=255, blank=True, null=True)
    rfc = models.CharField(max_length=13, blank=True, null=True)
    GIROS = [
        ('servicios', 'Servicios'),
        ('manufactura', 'Manufactura'),
        ('comercial', 'Comercial'),
    ]
    giro = models.CharField(max_length=20, choices=GIROS, blank=True, null=True)
    pagina_web = models.URLField(blank=True, null=True)
    numero_estudiantes = models.PositiveIntegerField(blank=True, null=True)
    ESPECIALIDADES = [
        ('ciberseguridad', 'Ciberseguridad'),
        ('ia', 'Inteligencia Artificial'),
        ('web', 'Desarrollo Web'),
    ]
    especialidad = models.CharField(max_length=30, choices=ESPECIALIDADES, blank=True, null=True)
    PERIODOS = [
        ('enero-junio', 'Enero - Junio'),
        ('agosto-diciembre', 'Agosto - Diciembre'),
    ]
    periodo = models.CharField(max_length=30, choices=PERIODOS, blank=True, null=True)
    competencias = models.TextField(blank=True, null=True)
    apoyo = models.BooleanField(default=False)
    tipo_apoyo = models.TextField(blank=True, null=True)
    estudiante_interesado = models.BooleanField(default=False)
    nombre_estudiante_solicitado = models.CharField(max_length=255, blank=True, null=True)

    # Exclusivo para instituciones
    es_tec = models.BooleanField(blank=True, null=True)
    incluir_asesor = models.BooleanField(blank=True, null=True)
    nombre_asesor = models.CharField(max_length=255, blank=True, null=True)

    observaciones = models.TextField(blank=True, null=True)
    imagen = models.ImageField(upload_to='proyectos_imagenes/', null=True, blank=True)


