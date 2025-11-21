from django.db import models

# Create your models here.
from django.db import models

class Especialidad(models.Model):
    """Especialidades disponibles en el sistema"""
    codigo = models.CharField(max_length=10, unique=True)
    nombre = models.CharField(max_length=100)
    activa = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['orden', 'nombre']
        verbose_name_plural = "Especialidades"
    
    def __str__(self):
        return self.nombre


class Modalidad(models.Model):
    """Modalidades de proyecto disponibles"""
    codigo = models.CharField(max_length=20, unique=True)
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True)
    activa = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['orden', 'nombre']
        verbose_name_plural = "Modalidades"
    
    def __str__(self):
        return self.nombre


class TipoDocumento(models.Model):
    """Tipos de documentos para expedientes"""
    nombre = models.CharField(max_length=200)
    descripcion = models.TextField(blank=True)
    requerido = models.BooleanField(default=True)
    dias_plazo = models.IntegerField(default=30, help_text="Días desde inicio de proyecto")
    activo = models.BooleanField(default=True)
    orden = models.IntegerField(default=0)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['orden', 'nombre']
        verbose_name_plural = "Tipos de Documento"
    
    def __str__(self):
        return self.nombre


class PeriodoAcademico(models.Model):
    """Periodos académicos"""
    nombre = models.CharField(max_length=50)  # Ej: "Agosto-Diciembre 2025"
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    activo = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-fecha_inicio']
        verbose_name_plural = "Periodos Académicos"
    
    def __str__(self):
        return self.nombre