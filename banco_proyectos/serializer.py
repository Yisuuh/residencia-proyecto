from rest_framework import serializers
from .models import FormularioProyecto

class FormularioProyectoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormularioProyecto
        fields = '__all__'