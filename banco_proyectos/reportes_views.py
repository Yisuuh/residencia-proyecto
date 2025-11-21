from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q
from users.models import Usuario
from .models import FormularioProyecto, AplicacionProyecto


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_alumnos(request):
    """
    GET /api/banco_proyectos/reportes/alumnos/
    Filtros: especialidad, con_proyecto, sexo, search
    """
    # ✅ CORRECCIÓN: jefe_carrera en lugar de jefe_academia
    if request.user.role != 'jefe_carrera':
        return Response({'error': 'No autorizado'}, status=403)
    
    # Filtros (✅ CORRECCIÓN: sexo en lugar de genero)
    especialidad = request.query_params.get('especialidad', '')
    con_proyecto = request.query_params.get('con_proyecto', '')
    sexo = request.query_params.get('sexo', '')  # ✅ Cambiado de genero a sexo
    search = request.query_params.get('search', '')
    
    # Query base
    alumnos = Usuario.objects.filter(role='alumno')
    
    # Aplicar filtros
    if especialidad:
        alumnos = alumnos.filter(especialidad=especialidad)
    
    # ✅ CORRECCIÓN: sexo en lugar de genero
    if sexo:
        alumnos = alumnos.filter(sexo=sexo)
    
    if search:
        alumnos = alumnos.filter(
            Q(nombres__icontains=search) |
            Q(primer_apellido__icontains=search) |
            Q(segundo_apellido__icontains=search) |
            Q(matricula__icontains=search) |
            Q(email__icontains=search)
        )
    
    # Filtrar por proyecto
    if con_proyecto == 'si':
        alumnos_con_proyecto = AplicacionProyecto.objects.filter(
            estado='aceptado'
        ).values_list('alumno_id', flat=True)
        alumnos = alumnos.filter(id__in=alumnos_con_proyecto)
    elif con_proyecto == 'no':
        alumnos_con_proyecto = AplicacionProyecto.objects.filter(
            estado='aceptado'
        ).values_list('alumno_id', flat=True)
        alumnos = alumnos.exclude(id__in=alumnos_con_proyecto)
    
    # Datos
    data = []
    for alumno in alumnos:
        proyecto_info = None
        aplicacion = AplicacionProyecto.objects.filter(
            alumno=alumno,
            estado='aceptado'
        ).select_related('proyecto').first()
        
        if aplicacion:
            proyecto_info = {
                'nombre': aplicacion.proyecto.nombre_proyecto,
                'empresa': aplicacion.proyecto.nombre_empresa or aplicacion.proyecto.nombre_institucion,
                'modalidad': aplicacion.proyecto.get_modalidad_display(),
            }
        
        data.append({
            'id': alumno.id,
            'matricula': alumno.matricula,
            'nombre': f"{alumno.nombres} {alumno.primer_apellido} {alumno.segundo_apellido}".strip(),
            'email': alumno.email,
            'telefono': alumno.telefono or 'N/A',
            'especialidad': alumno.get_especialidad_display() if hasattr(alumno, 'get_especialidad_display') else alumno.especialidad,
            'sexo': alumno.get_sexo_display() if hasattr(alumno, 'get_sexo_display') else alumno.sexo,  # ✅ CORRECCIÓN
            'tiene_proyecto': bool(proyecto_info),
            'proyecto': proyecto_info
        })
    
    return Response({
        'alumnos': data,
        'total': len(data)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_proyectos(request):
    """
    GET /api/banco_proyectos/reportes/proyectos/
    Filtros: estado, modalidad, especialidad, search
    """
    if request.user.role != 'jefe_carrera':
        return Response({'error': 'No autorizado'}, status=403)
    
    try:
        estado = request.query_params.get('estado', '')
        modalidad = request.query_params.get('modalidad', '')
        especialidad = request.query_params.get('especialidad', '')
        search = request.query_params.get('search', '')
        
        proyectos = FormularioProyecto.objects.all()
        
        if estado:
            proyectos = proyectos.filter(estado=estado)
        
        if modalidad:
            proyectos = proyectos.filter(modalidad=modalidad)
        
        if especialidad:
            proyectos = proyectos.filter(especialidad=especialidad)
        
        if search:
            proyectos = proyectos.filter(
                Q(nombre_proyecto__icontains=search) |
                Q(nombre_empresa__icontains=search) |
                Q(nombre_institucion__icontains=search)
            )
        
        data = []
        for proyecto in proyectos:
            alumnos_asignados = AplicacionProyecto.objects.filter(
                proyecto=proyecto,
                estado='aceptado'
            ).count()
            
            data.append({
                'id': proyecto.id,
                'nombre': proyecto.nombre_proyecto,
                'empresa': proyecto.nombre_empresa or proyecto.nombre_institucion or 'N/A',
                'modalidad': proyecto.get_modalidad_display(),
                'especialidad': proyecto.get_especialidad_display() if proyecto.especialidad else 'N/A',
                'estado': proyecto.estado,
                'estado_display': proyecto.get_estado_display(),
                'cupo': proyecto.numero_estudiantes or 0,
                'ocupados': alumnos_asignados,
                'disponibles': (proyecto.numero_estudiantes or 0) - alumnos_asignados,
                'fecha_registro': proyecto.fecha_subida.strftime('%Y-%m-%d') if proyecto.fecha_subida else 'N/A',  # ✅ fecha_subida
            })
        
        return Response({
            'proyectos': data,
            'total': len(data)
        })
        
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def reporte_estadisticas(request):
    """
    GET /api/banco_proyectos/reportes/estadisticas/
    Dashboard con resumen general
    """
    # ✅ CORRECCIÓN: jefe_carrera
    if request.user.role != 'jefe_carrera':
        return Response({'error': 'No autorizado'}, status=403)
    
    # Alumnos
    total_alumnos = Usuario.objects.filter(role='alumno').count()
    alumnos_con_proyecto = AplicacionProyecto.objects.filter(
        estado='aceptado'
    ).values('alumno').distinct().count()
    alumnos_sin_proyecto = total_alumnos - alumnos_con_proyecto
    
    # Proyectos
    total_proyectos = FormularioProyecto.objects.count()
    proyectos_activos = FormularioProyecto.objects.filter(estado='activo').count()
    proyectos_terminados = FormularioProyecto.objects.filter(estado='terminado').count()
    
    # Por especialidad
    alumnos_por_especialidad = Usuario.objects.filter(role='alumno').values('especialidad').annotate(
        total=Count('id')
    )
    
    # ✅ CORRECCIÓN: sexo en lugar de genero
    alumnos_por_sexo = Usuario.objects.filter(role='alumno').values('sexo').annotate(
        total=Count('id')
    )
    
    # Proyectos por modalidad
    proyectos_por_modalidad = FormularioProyecto.objects.values('modalidad').annotate(
        total=Count('id')
    )
    
    return Response({
        'alumnos': {
            'total': total_alumnos,
            'con_proyecto': alumnos_con_proyecto,
            'sin_proyecto': alumnos_sin_proyecto,
            'porcentaje_asignacion': round((alumnos_con_proyecto / total_alumnos * 100), 2) if total_alumnos > 0 else 0,
            'por_especialidad': list(alumnos_por_especialidad),
            'por_sexo': list(alumnos_por_sexo),  # ✅ CORRECCIÓN
        },
        'proyectos': {
            'total': total_proyectos,
            'activos': proyectos_activos,
            'terminados': proyectos_terminados,
            'por_modalidad': list(proyectos_por_modalidad),
        }
    })