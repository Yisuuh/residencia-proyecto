from rest_framework import serializers
from .models import Documento, DocumentoPredefinido

class DocumentoPredefinidoSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentoPredefinido
        fields = '__all__'


class DocumentoSerializer(serializers.ModelSerializer):
    documento_predefinido = DocumentoPredefinidoSerializer()  # Incluye los datos del documento predefinido

    class Meta:
        model = Documento
        fields = '__all__'