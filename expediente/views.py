from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Documento, DocumentoPredefinido
from .serializers import DocumentoSerializer, DocumentoPredefinidoSerializer
from django.utils import timezone
from django.db import transaction
from datetime import date

class DocumentoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        alumno = request.user
        try:
            # Si el alumno aún no tiene documentos, crearlos automáticamente
            if not Documento.objects.filter(alumno=alumno).exists():
                with transaction.atomic():
                    predefinidos = DocumentoPredefinido.objects.all()
                    for doc in predefinidos:
                        Documento.objects.create(
                            alumno=alumno,
                            documento_predefinido=doc,
                            fecha_programada=timezone.now().date()
                        )

            # Retornar los documentos ya existentes
            documentos = Documento.objects.filter(alumno=alumno)
            serializer = DocumentoSerializer(documentos, many=True)
            return Response(serializer.data)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def put(self, request, pk):
        try:
            documento = Documento.objects.get(pk=pk, alumno=request.user)
        except Documento.DoesNotExist:
            return Response({"error": "Documento no encontrado"}, status=404)

        archivo = request.FILES.get("archivo")
        if archivo:
            # Eliminar el archivo anterior si existe
            if documento.archivo:
                documento.archivo.delete()

            documento.archivo = archivo
            documento.fecha_envio = date.today()
            documento.save()

        return Response({
            "message": "Archivo subido correctamente",
            "fecha_envio": documento.fecha_envio
        })


class DocumentosPredefinidosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            documentos_predefinidos = DocumentoPredefinido.objects.all()
            serializer = DocumentoPredefinidoSerializer(documentos_predefinidos, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
