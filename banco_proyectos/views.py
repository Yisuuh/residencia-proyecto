from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import AplicacionProyecto, FormularioProyecto
from .serializer import AplicacionProyectoSerializer, FormularioProyectoSerializer

# a) POST /api/aplicar/
class AplicarProyectoView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        proyecto_id = request.data.get("proyecto")
        proyecto = get_object_or_404(FormularioProyecto, id=proyecto_id)
        # Evitar aplicar dos veces
        if AplicacionProyecto.objects.filter(alumno=request.user, proyecto=proyecto).exists():
            return Response({"detail": "Ya has aplicado a este proyecto"}, status=status.HTTP_400_BAD_REQUEST)
        
        aplicacion = AplicacionProyecto.objects.create(alumno=request.user, proyecto=proyecto)
        serializer = AplicacionProyectoSerializer(aplicacion)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

# b) GET /api/empresa/proyecto/<id>/aplicaciones/
class AplicacionesPorProyectoView(generics.ListAPIView):
    serializer_class = AplicacionProyectoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        proyecto_id = self.kwargs['proyecto_id']
        return AplicacionProyecto.objects.filter(proyecto_id=proyecto_id)

# c) PATCH /api/aplicacion/<id>/
class ActualizarEstadoAplicacionView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        aplicacion = get_object_or_404(AplicacionProyecto, pk=pk)
        nuevo_estado = request.data.get("estado")
        if nuevo_estado not in ["aceptado", "rechazado"]:
            return Response({"detail": "Estado inválido."}, status=status.HTTP_400_BAD_REQUEST)

        # Lógica de vacantes
        if nuevo_estado == "aceptado":
            proyecto = aplicacion.proyecto
            aceptados = AplicacionProyecto.objects.filter(proyecto=proyecto, estado="aceptado").count()
            cupo = proyecto.numero_estudiantes or 1
            if aceptados >= cupo:
                return Response({"detail": "Ya se llenó el cupo de este proyecto."}, status=status.HTTP_400_BAD_REQUEST)

        aplicacion.estado = nuevo_estado
        aplicacion.save()
        serializer = AplicacionProyectoSerializer(aplicacion)
        return Response(serializer.data)

# FormularioProyecto views
class FormularioProyectoListCreateView(generics.ListCreateAPIView):
    queryset = FormularioProyecto.objects.all()
    serializer_class = FormularioProyectoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(empresa=self.request.user)

# d) GET /api/empresa/aplicaciones/
class AplicacionesPorEmpresaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        empresa = request.user
        aplicaciones = AplicacionProyecto.objects.filter(
            proyecto__empresa=empresa,
            estado="pendiente"
        )
        serializer = AplicacionProyectoSerializer(aplicaciones, many=True)
        return Response(serializer.data)

# e) GET /api/empresa/aplicaciones/aprobadas/
class ResidentesAprobadosEmpresaView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        empresa = request.user
        aplicaciones = AplicacionProyecto.objects.filter(
            proyecto__empresa=empresa,
            estado="aceptado"
        ).select_related('proyecto', 'alumno')
        serializer = AplicacionProyectoSerializer(aplicaciones, many=True)
        return Response(serializer.data)