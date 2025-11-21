from django.shortcuts import render, get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from .models import AplicacionProyecto, FormularioProyecto
from .serializer import AplicacionProyectoSerializer, FormularioProyectoSerializer


# ============================================
# VISTAS PARA APLICACIONES (ALUMNOS)
# ============================================

class AplicarProyectoView(APIView):
    """POST /api/aplicar/ - Alumno aplica a un proyecto"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            proyecto_id = request.data.get('proyecto_id')
            
            if not proyecto_id:
                return Response({
                    'error': 'ID del proyecto requerido'
                }, status=status.HTTP_400_BAD_REQUEST)

            # ✅ VALIDACIÓN 1: Verificar si ya tiene proyecto aprobado
            aplicacion_aprobada = AplicacionProyecto.objects.filter(
                alumno=request.user,
                estado='aceptado'
            ).exists()
            
            if aplicacion_aprobada:
                return Response({
                    'error': 'Ya tienes un proyecto aceptado. No puedes postularte a otros proyectos.',
                    'tipo_error': 'proyecto_aprobado'
                }, status=status.HTTP_400_BAD_REQUEST)

            # ✅ VALIDACIÓN 2: Verificar límite de 3 aplicaciones
            aplicaciones_pendientes = AplicacionProyecto.objects.filter(
                alumno=request.user,
                estado__in=['pendiente', 'en_revision']
            ).count()
            
            if aplicaciones_pendientes >= 3:
                return Response({
                    'error': 'Has alcanzado el límite máximo de 3 postulaciones activas. Espera respuesta de las empresas antes de aplicar a más proyectos.',
                    'tipo_error': 'limite_aplicaciones',
                    'aplicaciones_activas': aplicaciones_pendientes
                }, status=status.HTTP_400_BAD_REQUEST)

            # ✅ VALIDACIÓN 3: Verificar si ya aplicó a este proyecto
            aplicacion_existente = AplicacionProyecto.objects.filter(
                alumno=request.user,
                proyecto_id=proyecto_id
            ).exists()
            
            if aplicacion_existente:
                return Response({
                    'error': 'Ya te has postulado a este proyecto anteriormente.',
                    'tipo_error': 'aplicacion_duplicada'
                }, status=status.HTTP_400_BAD_REQUEST)

            # ✅ Verificar que el proyecto existe y está activo
            try:
                proyecto = FormularioProyecto.objects.get(id=proyecto_id, estado='activo')
            except FormularioProyecto.DoesNotExist:
                return Response({
                    'error': 'El proyecto no existe o ya no está disponible'
                }, status=status.HTTP_404_NOT_FOUND)

            # ✅ Crear la aplicación
            aplicacion = AplicacionProyecto.objects.create(
                alumno=request.user,
                proyecto=proyecto,
                estado='pendiente'
            )
            
            print(f"✅ Aplicación creada: {aplicacion.id} - {request.user.email} -> {proyecto.nombre_proyecto}")
            
            return Response({
                'message': 'Aplicación enviada exitosamente',
                'aplicacion_id': aplicacion.id,
                'aplicaciones_restantes': 3 - aplicaciones_pendientes - 1
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"❌ ERROR en AplicarProyectoView: {e}")
            import traceback
            traceback.print_exc()
            
            return Response({
                'error': 'Error interno del servidor'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class MisAplicacionesView(APIView):
    """GET /api/alumno/mis-aplicaciones/ - Ver aplicaciones del alumno"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            aplicaciones = AplicacionProyecto.objects.filter(
                alumno=request.user
            ).select_related('proyecto')
            
            aplicaciones_data = []
            for app in aplicaciones:
                aplicaciones_data.append({
                    'id': app.id,
                    'proyecto_id': app.proyecto.id,
                    'proyecto_nombre': app.proyecto.nombre_proyecto,
                    'estado': app.estado,
                    'fecha_aplicacion': app.fecha_aplicacion.strftime('%Y-%m-%d'),
                    'proyecto_empresa': app.proyecto.nombre_empresa
                })
            
            aplicaciones_activas = aplicaciones.filter(
                estado__in=['pendiente', 'en_revision']
            ).count()
            
            tiene_proyecto_aprobado = aplicaciones.filter(estado='aceptado').exists()
            
            print(f"✅ {request.user.email} - {len(aplicaciones_data)} aplicaciones, {aplicaciones_activas} activas")
            
            return Response({
                'aplicaciones': aplicaciones_data,
                'aplicaciones_activas': aplicaciones_activas,
                'tiene_proyecto_aprobado': tiene_proyecto_aprobado,
                'total_aplicaciones': len(aplicaciones_data)
            })
            
        except Exception as e:
            print(f"❌ ERROR en MisAplicacionesView: {e}")
            return Response({
                'error': 'Error al obtener aplicaciones'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SolicitudesAceptadasAlumnoView(APIView):
    """GET /api/alumno/solicitudes-aceptadas/ - Ver solicitudes aceptadas por empresas"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            aplicaciones = AplicacionProyecto.objects.filter(
                alumno=request.user,
                estado='aceptado_por_empresa'
            ).select_related('proyecto', 'proyecto__empresa')
            
            serializer = AplicacionProyectoSerializer(aplicaciones, many=True)
            
            print(f"✅ {request.user.email} - {len(aplicaciones)} solicitudes aceptadas por empresas")
            
            return Response({
                'solicitudes': serializer.data,
                'total': len(aplicaciones)
            })
            
        except Exception as e:
            print(f"❌ ERROR en SolicitudesAceptadasAlumnoView: {e}")
            return Response({
                'error': 'Error al obtener solicitudes'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ConfirmarProyectoAlumnoView(APIView):
    """POST /api/alumno/confirmar-proyecto/ - Confirmar proyecto elegido"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            aplicacion_id = request.data.get('aplicacion_id')
            
            if not aplicacion_id:
                return Response({
                    'error': 'ID de aplicación requerido'
                }, status=status.HTTP_400_BAD_REQUEST)

            aplicacion = get_object_or_404(
                AplicacionProyecto,
                id=aplicacion_id,
                alumno=request.user,
                estado='aceptado_por_empresa'
            )

            ya_tiene_proyecto = AplicacionProyecto.objects.filter(
                alumno=request.user,
                estado='aceptado'
            ).exists()

            if ya_tiene_proyecto:
                return Response({
                    'error': 'Ya tienes un proyecto confirmado'
                }, status=status.HTTP_400_BAD_REQUEST)

            # Confirmar aplicación seleccionada
            aplicacion.estado = 'aceptado'
            aplicacion.save()

            # Rechazar automáticamente las demás
            AplicacionProyecto.objects.filter(
                alumno=request.user
            ).exclude(
                id=aplicacion_id
            ).update(estado='rechazado')

            print(f"✅ Alumno {request.user.email} confirmó proyecto: {aplicacion.proyecto.nombre_proyecto}")

            return Response({
                'message': 'Proyecto confirmado exitosamente',
                'proyecto': {
                    'id': aplicacion.proyecto.id,
                    'nombre': aplicacion.proyecto.nombre_proyecto,
                    'empresa': aplicacion.proyecto.nombre_empresa
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"❌ ERROR en ConfirmarProyectoAlumnoView: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                'error': 'Error al confirmar proyecto'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProyectoAceptadoAlumnoView(APIView):
    """GET /api/alumno/proyecto-aceptado/ - Ver proyecto aceptado del alumno"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            print(f"🔍 Buscando proyecto para usuario: {request.user.email}")
            
            aplicacion = AplicacionProyecto.objects.filter(
                alumno=request.user,
                estado="aceptado"
            ).select_related('proyecto', 'alumno').first()
            
            if not aplicacion:
                print("⚠️ No hay proyecto aceptado")
                return Response({
                    "message": "No tienes un proyecto aceptado"
                }, status=status.HTTP_200_OK)
            
            print(f"✅ Proyecto encontrado: {aplicacion.proyecto.nombre_proyecto}")
            
            serializer = AplicacionProyectoSerializer(aplicacion)
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ ERROR: {e}")
            import traceback
            traceback.print_exc()
            return Response({
                "error": "Error interno del servidor"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ============================================
# VISTAS PARA EMPRESAS
# ============================================

class AplicacionesPorProyectoView(generics.ListAPIView):
    """GET /api/empresa/proyecto/<id>/aplicaciones/ - Ver aplicaciones de un proyecto"""
    serializer_class = AplicacionProyectoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        proyecto_id = self.kwargs['proyecto_id']
        proyecto = get_object_or_404(FormularioProyecto, id=proyecto_id)
        
        # Solo la empresa dueña puede ver las aplicaciones
        if self.request.user.role == 'empresa' and proyecto.empresa != self.request.user:
            raise PermissionDenied("No tienes permiso para ver las aplicaciones de este proyecto")
        
        return AplicacionProyecto.objects.filter(proyecto_id=proyecto_id).select_related('alumno', 'proyecto')


class ActualizarEstadoAplicacionView(APIView):
    """PATCH /api/aplicacion/<id>/ - Aceptar/rechazar aplicación"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, pk):
        aplicacion = get_object_or_404(AplicacionProyecto, pk=pk)
        
        # Solo la empresa dueña puede actualizar
        if request.user.role == 'empresa' and aplicacion.proyecto.empresa != request.user:
            return Response(
                {"detail": "No tienes permiso para actualizar esta aplicación."}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        nuevo_estado = request.data.get("estado")
        
        # Cuando empresa acepta, estado es "aceptado_por_empresa"
        if nuevo_estado == "aceptado":
            nuevo_estado = "aceptado_por_empresa"
        
        if nuevo_estado not in ["aceptado_por_empresa", "rechazado"]:
            return Response({"detail": "Estado inválido."}, status=status.HTTP_400_BAD_REQUEST)

        # Verificar cupo antes de aceptar
        if nuevo_estado == "aceptado_por_empresa":
            proyecto = aplicacion.proyecto
            
            # Contar cuántos ya están aceptados FINALMENTE (por alumno)
            aceptados = AplicacionProyecto.objects.filter(
                proyecto=proyecto, 
                estado="aceptado"
            ).count()
            
            cupo = proyecto.numero_estudiantes or 1
            
            print(f"📊 Verificando cupo: {aceptados}/{cupo} ocupados")
            
            if aceptados >= cupo:
                return Response(
                    {"detail": f"Ya se llenó el cupo de este proyecto ({cupo} estudiantes)."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Actualizar estado
        aplicacion.estado = nuevo_estado
        aplicacion.save()
        
        print(f"✅ Estado actualizado: Aplicación {pk} -> {nuevo_estado}")
        
        serializer = AplicacionProyectoSerializer(aplicacion)
        return Response(serializer.data)


class AplicacionesPorEmpresaView(APIView):
    """GET /api/empresa/aplicaciones/ - Ver todas las aplicaciones pendientes"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        empresa = request.user
        aplicaciones = AplicacionProyecto.objects.filter(
            proyecto__empresa=empresa,
            estado="pendiente"
        ).select_related('proyecto', 'alumno')
        serializer = AplicacionProyectoSerializer(aplicaciones, many=True)
        return Response(serializer.data)


class ResidentesAprobadosEmpresaView(APIView):
    """GET /api/empresa/aplicaciones/aprobadas/ - Ver residentes aprobados"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        empresa = request.user
        aplicaciones = AplicacionProyecto.objects.filter(
            proyecto__empresa=empresa,
            estado="aceptado"
        ).select_related('proyecto', 'alumno')
        serializer = AplicacionProyectoSerializer(aplicaciones, many=True)
        return Response(serializer.data)


# ============================================
# VISTAS PARA PROYECTOS (CRUD)
# ============================================

class FormularioProyectoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar proyectos con acciones personalizadas
    """
    serializer_class = FormularioProyectoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filtrado automático según rol:
        - Empresa: solo proyectos activos propios
        - Alumno: solo proyectos activos de todas las empresas
        - Admin/Coordinador: todos los proyectos
        """
        user = self.request.user
        
        if user.role == 'empresa':
            return FormularioProyecto.objects.filter(
                empresa=user,
                estado='activo'
            ).prefetch_related('aplicaciones')
        
        elif user.role == 'alumno':
            return FormularioProyecto.objects.filter(
                estado='activo'
            ).select_related('empresa')
        
        else:
            return FormularioProyecto.objects.all()

    def perform_create(self, serializer):
        """Al crear, asignar empresa logueada"""
        if self.request.user.role != 'empresa':
            raise PermissionDenied("Solo las empresas pueden crear proyectos")
        
        proyecto = serializer.save(empresa=self.request.user)
        print(f"✅ Proyecto creado: {proyecto.nombre_proyecto} por {self.request.user.email}")

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['post'], url_path='terminar')
    def terminar_proyecto(self, request, pk=None):
        """
        POST /api/banco_proyectos/formulario_proyecto/{id}/terminar/
        Marca un proyecto como terminado
        """
        proyecto = self.get_object()
        
        # Verificar que sea la empresa dueña
        if request.user.role == 'empresa':
            if request.user != proyecto.empresa:
                return Response(
                    {'error': 'No tienes permisos para terminar este proyecto'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.role != 'jefe_carrera':
            return Response(
                {'error': 'Solo la empresa o el jefe de academia pueden terminar proyectos'},
                status=status.HTTP_403_FORBIDDEN
            )
        # Verificar que el proyecto esté activo
        if proyecto.estado == 'terminado':
            return Response(
                {'error': 'Este proyecto ya está terminado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Marcar como terminado
        proyecto.estado = 'terminado'
        proyecto.fecha_terminado = timezone.now()
        proyecto.save()
        
        print(f"✅ Proyecto terminado: {proyecto.nombre_proyecto}")
        
        return Response({
            'success': True,
            'message': 'Proyecto marcado como terminado exitosamente',
            'proyecto': FormularioProyectoSerializer(proyecto, context={'request': request}).data
        })
    
    @action(detail=False, methods=['get'], url_path='terminados')
    def proyectos_terminados(self, request):
        """
        GET /api/banco_proyectos/formulario_proyecto/terminados/
        Lista proyectos terminados de la empresa
        """
        if request.user.role == 'empresa':
                return Response(
                    {'error': 'No tienes permisos para terminar este proyecto'},
                    status=status.HTTP_403_FORBIDDEN
                )
        elif request.user.role != 'jefe_carrera':
            return Response(
                {'error': 'Solo la empresa o el jefe de academia pueden terminar proyectos'},
                status=status.HTTP_403_FORBIDDEN
            )
        proyectos = FormularioProyecto.objects.filter(
            empresa=request.user,
            estado='terminado'
        ).order_by('-fecha_terminado')
        
        serializer = self.get_serializer(proyectos, many=True)
        return Response({
            'proyectos': serializer.data,
            'total': proyectos.count()
        })
    
    @action(detail=True, methods=['get'], url_path='alumnos')
    def obtener_alumnos(self, request, pk=None):
        """
        GET /api/banco_proyectos/formulario_proyecto/{id}/alumnos/
        Obtiene la lista de alumnos asignados a un proyecto
        """
        proyecto = self.get_object()
        
        # Obtener aplicaciones aprobadas (confirmadas por el alumno)
        aplicaciones = AplicacionProyecto.objects.filter(
            proyecto=proyecto,
            estado='aceptado'
        ).select_related('alumno')
        
        alumnos_data = []
        for app in aplicaciones:
            alumno = app.alumno
            alumnos_data.append({
                'id': alumno.id,
                'nombre': f"{alumno.nombres or ''} {alumno.primer_apellido or ''} {alumno.segundo_apellido or ''}".strip(),
                'nombres': alumno.nombres,
                'primer_apellido': alumno.primer_apellido,
                'segundo_apellido': alumno.segundo_apellido,
                'matricula': alumno.matricula,
                'correo': alumno.email,
                'telefono': alumno.telefono,
                'especialidad': alumno.especialidad,
                'especialidad_display': alumno.get_especialidad_display() if hasattr(alumno, 'get_especialidad_display') else alumno.especialidad,
                'estado': app.estado,
                'fecha_aplicacion': app.fecha_aplicacion.strftime('%Y-%m-%d %H:%M'),
                'fecha_actualizacion': app.fecha_actualizacion.strftime('%Y-%m-%d %H:%M'),
            })
        
        print(f"✅ Proyecto {proyecto.id}: {len(alumnos_data)} alumnos asignados")
        
        return Response({
            'proyecto_id': proyecto.id,
            'proyecto_nombre': proyecto.nombre_proyecto,
            'total_alumnos': len(alumnos_data),
            'cupo_maximo': proyecto.numero_estudiantes,
            'alumnos': alumnos_data
        })
    
    @action(detail=True, methods=['post'], url_path='agregar-alumno')
    def agregar_alumno(self, request, pk=None):
        """
        POST /api/banco_proyectos/formulario_proyecto/{id}/agregar-alumno/
        Agrega un alumno al proyecto (solo jefe de carrera)
        
        Body: { "alumno_id": 5 }
        """
        proyecto = self.get_object()
        
        # Verificar que sea jefe de carrera
        if request.user.role != 'jefe_carrera':
            return Response(
                {'error': 'Solo el jefe de carrera puede agregar alumnos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        alumno_id = request.data.get('alumno_id')
        
        if not alumno_id:
            return Response(
                {'error': 'Se requiere el ID del alumno'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from users.models import Usuario
            alumno = Usuario.objects.get(id=alumno_id, role='alumno')
        except Usuario.DoesNotExist:
            return Response(
                {'error': 'Alumno no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Verificar cupo disponible
        aplicaciones_actuales = AplicacionProyecto.objects.filter(
            proyecto=proyecto,
            estado='aceptado'
        ).count()
        
        if aplicaciones_actuales >= proyecto.numero_estudiantes:
            return Response(
                {'error': 'El proyecto ya alcanzó el cupo máximo de estudiantes'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar si ya está aplicado
        aplicacion_existente = AplicacionProyecto.objects.filter(
            proyecto=proyecto,
            alumno=alumno
        ).first()
        
        if aplicacion_existente:
            if aplicacion_existente.estado == 'aceptado':
                return Response(
                    {'error': 'El alumno ya está asignado a este proyecto'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            else:
                # Actualizar estado a aceptado
                aplicacion_existente.estado = 'aceptado'
                aplicacion_existente.save()
                mensaje = 'Alumno reasignado exitosamente'
        else:
            # Crear nueva aplicación
            AplicacionProyecto.objects.create(
                proyecto=proyecto,
                alumno=alumno,
                estado='aceptado'
            )
            mensaje = 'Alumno agregado exitosamente'
        
        print(f"✅ {mensaje}: {alumno.email} → Proyecto {proyecto.nombre_proyecto}")
        
        return Response({
            'success': True,
            'message': mensaje,
            'alumno': {
                'id': alumno.id,
                'nombre': f"{alumno.nombres or ''} {alumno.primer_apellido or ''} {alumno.segundo_apellido or ''}".strip(),
                'matricula': alumno.matricula,
                'correo': alumno.email
            }
        })

    @action(detail=True, methods=['post'], url_path='quitar-alumno')
    def quitar_alumno(self, request, pk=None):
        """
        POST /api/banco_proyectos/formulario_proyecto/{id}/quitar-alumno/
        Quita un alumno del proyecto (solo jefe de carrera)
        
        Body: { "alumno_id": 5 }
        """
        proyecto = self.get_object()
        
        # Verificar que sea jefe de carrera
        if request.user.role != 'jefe_carrera':
            return Response(
                {'error': 'Solo el jefe de carrera puede quitar alumnos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        alumno_id = request.data.get('alumno_id')
        
        if not alumno_id:
            return Response(
                {'error': 'Se requiere el ID del alumno'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            aplicacion = AplicacionProyecto.objects.get(
                proyecto=proyecto,
                alumno_id=alumno_id,
                estado='aceptado'
            )
        except AplicacionProyecto.DoesNotExist:
            return Response(
                {'error': 'El alumno no está asignado a este proyecto'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Eliminar la aplicación
        alumno_nombre = f"{aplicacion.alumno.nombres or ''} {aplicacion.alumno.primer_apellido or ''}".strip()
        aplicacion.delete()
        
        print(f"✅ Alumno removido: {alumno_nombre} del proyecto {proyecto.nombre_proyecto}")
        
        return Response({
            'success': True,
            'message': 'Alumno removido del proyecto exitosamente'
        })

    @action(detail=True, methods=['get'], url_path='buscar-alumnos')
    def buscar_alumnos(self, request, pk=None):  # ✅ BIEN: Requiere pk
        """
        GET /api/banco_proyectos/formulario_proyecto/buscar-alumnos/?q=busqueda
        Busca alumnos por nombre, matrícula o correo
        """
        if request.user.role != 'jefe_carrera':
            return Response(
                {'error': 'Solo el jefe de carrera puede buscar alumnos'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        query = request.query_params.get('q', '').strip()
        
        if len(query) < 2:
            return Response({
                'alumnos': [],
                'message': 'Escribe al menos 2 caracteres para buscar'
            })
        
        from users.models import Usuario
        from django.db.models import Q
        
        alumnos = Usuario.objects.filter(
            role='alumno'
        ).filter(
            Q(nombres__icontains=query) |
            Q(primer_apellido__icontains=query) |
            Q(segundo_apellido__icontains=query) |
            Q(matricula__icontains=query) |
            Q(email__icontains=query)
        )[:20]  # Limitar a 20 resultados
        
        resultados = []
        for alumno in alumnos:
            resultados.append({
                'id': alumno.id,
                'nombre': f"{alumno.nombres or ''} {alumno.primer_apellido or ''} {alumno.segundo_apellido or ''}".strip(),
                'matricula': alumno.matricula,
                'correo': alumno.email,
                'especialidad': alumno.especialidad,
                'especialidad_display': alumno.get_especialidad_display() if hasattr(alumno, 'get_especialidad_display') else alumno.especialidad
            })
        
        return Response({
            'alumnos': resultados,
            'total': len(resultados)
        })