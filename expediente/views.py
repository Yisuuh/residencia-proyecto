from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from users.models import Usuario
from banco_proyectos.models import AplicacionProyecto, FormularioProyecto
from expediente.models import Documento, DocumentoPredefinido
from .serializers import DocumentoSerializer, DocumentoPredefinidoSerializer
from django.utils import timezone
from django.db import transaction
from datetime import date

class DocumentoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        alumno_id = request.query_params.get("alumno_id")
        if alumno_id:
            # Solo permitir si el usuario es jefe o coordinador
            if not request.user.rol in ["jefe_carrera", "coordinador", "admin"]:
                return Response({"error": "No tienes permiso para ver otros expedientes."}, status=403)
            try:
                alumno = Usuario.objects.get(pk=alumno_id)
            except Usuario.DoesNotExist:
                return Response({"error": "Alumno no encontrado"}, status=404)
            documentos = Documento.objects.filter(alumno=alumno)
        else:
            alumno = request.user
            # Crea documentos si no existen (lógica existente)
            if not Documento.objects.filter(alumno=alumno).exists():
                with transaction.atomic():
                    predefinidos = DocumentoPredefinido.objects.all()
                    for doc in predefinidos:
                        Documento.objects.create(
                            alumno=alumno,
                            documento_predefinido=doc,
                            fecha_programada=timezone.now().date()
                        )
            documentos = Documento.objects.filter(alumno=alumno)
        serializer = DocumentoSerializer(documentos, many=True)
        return Response(serializer.data)

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

    def patch(self, request, pk):
        try:
            documento = Documento.objects.get(pk=pk)
        except Documento.DoesNotExist:
            return Response({"error": "Documento no encontrado"}, status=404)

        estado = request.data.get("estado")
        observaciones = request.data.get("observaciones")

        if estado:
            documento.estado = estado
        if observaciones is not None:
            documento.observaciones = observaciones
        documento.save()

        serializer = DocumentoSerializer(documento)
        return Response(serializer.data)


class DocumentosPredefinidosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            documentos_predefinidos = DocumentoPredefinido.objects.all()
            serializer = DocumentoPredefinidoSerializer(documentos_predefinidos, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class ExpedientesAlumnosView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Obtén todos los alumnos con proyecto aceptado
        aplicaciones = AplicacionProyecto.objects.filter(estado="aceptado").select_related('alumno', 'proyecto')
        documentos_total = DocumentoPredefinido.objects.count()
        expedientes = []

        for aplicacion in aplicaciones:
            alumno = aplicacion.alumno
            documentos = Documento.objects.filter(alumno=alumno)
            documentos_subidos = documentos.exclude(archivo="").exclude(archivo=None).count()
            ultima_modificacion = documentos.order_by('-fecha_envio').first()
            expedientes.append({
                "matricula": alumno.matricula,
                "nombre": f"{alumno.nombres} {alumno.primer_apellido} {alumno.segundo_apellido}",
                "proyecto": aplicacion.proyecto.nombre_proyecto,
                "documentos_subidos": documentos_subidos,
                "total_documentos": documentos_total,
                "ultima_modificacion": ultima_modificacion.fecha_envio if ultima_modificacion else None,
                "alumno_id": alumno.id,
            })
        return Response(expedientes)
