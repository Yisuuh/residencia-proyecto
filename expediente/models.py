from django.db import models
from django.conf import settings
from django.utils.text import slugify
import os

# Mover la función fuera de la clase para que sea accesible globalmente
def user_document_path(instance, filename):
    name, ext = os.path.splitext(filename)
    carpeta = slugify(instance.documento_predefinido.nombre, allow_unicode=True)
    safe_name = slugify(name, allow_unicode=True)
    safe_filename = f"{safe_name}{ext}"
    return f'usuarios/{instance.alumno.id}/documentos/{carpeta}/{safe_filename}'

class DocumentoPredefinido(models.Model):
    nombre = models.CharField(max_length=255)  # Nombre del documento predefinido

    def __str__(self):
        return self.nombre

class Documento(models.Model):
    ESTADOS = [
        ('pendiente', 'Pendiente'),
        ('aprobado', 'Aprobado'),
        ('rechazado', 'Rechazado'),
    ]

    alumno = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documentos"
    )  # Relación con el usuario (alumno)
    documento_predefinido = models.ForeignKey(
        DocumentoPredefinido,
        on_delete=models.CASCADE,
        related_name="documentos"
    )  # Relación con el documento predefinido
    archivo = models.FileField(upload_to=user_document_path, null=True, blank=True)  # Archivo del documento
    estado = models.CharField(max_length=20, choices=ESTADOS, default='pendiente')  # Estado del documento
    fecha_programada = models.DateField()  # Fecha establecida por el jefe de carrera
    fecha_envio = models.DateField(null=True, blank=True)  # Fecha en la que el alumno subió el documento
    observaciones = models.TextField(null=True, blank=True)  # Observaciones del coordinador

    def __str__(self):
        return f"{self.documento_predefinido.nombre} - {self.alumno.email}"
