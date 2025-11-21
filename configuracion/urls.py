from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    EspecialidadViewSet,
    ModalidadViewSet,
    TipoDocumentoViewSet,
    PeriodoAcademicoViewSet
)

router = DefaultRouter()
router.register(r'especialidades', EspecialidadViewSet)
router.register(r'modalidades', ModalidadViewSet)
router.register(r'tipos-documento', TipoDocumentoViewSet)
router.register(r'periodos', PeriodoAcademicoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]