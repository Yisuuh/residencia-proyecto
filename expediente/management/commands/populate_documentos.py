from django.core.management.base import BaseCommand
from expediente.models import DocumentoPredefinido

class Command(BaseCommand):
    help = 'Poblar la tabla de documentos predefinidos'

    def handle(self, *args, **kwargs):
        documentos = [
            "Solicitud de Residencia",
            "Terminación de Servicio Social",
            "Anteproyecto",
            "Carta de presentación",
            "Carta de aceptación",
            "Comprobante de pago",
            "Primera evalución",
            "Segunda evaluación",
            "Evaluación final",
        ]

        for nombre in documentos:
            DocumentoPredefinido.objects.get_or_create(nombre=nombre)

        self.stdout.write(self.style.SUCCESS('Documentos predefinidos creados exitosamente.'))