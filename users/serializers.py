import re
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from .models import Usuario
from django.contrib.auth.hashers import make_password


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'  # Campo que se va a usar como identificador

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(request=self.context.get("request"), email=email, password=password)

        if not user:
            raise AuthenticationFailed("Email o contraseña incorrectos", code="authentication_failed")

        data = super().validate(attrs)

        # Información adicional
        data['email'] = user.email
        data['role'] = user.role

        return data

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'email','nombres','primer_apellido', 'password', 'role', 'is_active', 'is_staff']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        """Crear un usuario con contraseña encriptada."""
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

    def update(self, instance, validated_data):
        """Actualizar un usuario, manejando la contraseña correctamente."""
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)

class UsuarioRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Usuario
        fields = ['email', 'password', 'confirm_password', 'nombres', 'primer_apellido', 'segundo_apellido', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def validate_email(self, value):
        """Validar que el email tenga un dominio permitido."""
        valid_domains = ['@merida.tecnm.mx', '@itmerida.edu.mx']
        if not any(value.endswith(domain) for domain in valid_domains):
            raise serializers.ValidationError(f"El email debe tener una de las siguientes terminaciones: {', '.join(valid_domains)}")
        return value

    def validate_password(self, value):
        """Validar que la contraseña cumpla con los requisitos."""
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra minúscula.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return value

    def validate_nombres(self, value):
        """Validar que los nombres solo contengan letras y espacios."""
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', value):
            raise serializers.ValidationError("El campo 'nombres' solo puede contener letras y espacios.")
        return value

    def validate_primer_apellido(self, value):
        """Validar que el primer apellido solo contenga letras y guiones."""
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\-]+$', value):
            raise serializers.ValidationError("El campo 'primer_apellido' solo puede contener letras y guiones.")
        return value

    def validate_segundo_apellido(self, value):
        """Validar que el segundo apellido solo contenga letras y guiones."""
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\-]+$', value):
            raise serializers.ValidationError("El campo 'segundo_apellido' solo puede contener letras y guiones.")
        return value

    def validate(self, data):
        """Validar que las contraseñas coincidan."""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return data

    def create(self, validated_data):
        """Crear un usuario con contraseña encriptada."""
        validated_data.pop('confirm_password')  # Eliminar confirm_password antes de crear el usuario
        validated_data['password'] = make_password(validated_data['password'])
        return Usuario.objects.create(**validated_data)

class EmpresaRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Usuario
        fields = ['email', 'password', 'confirm_password', 'nombres', 'primer_apellido', 'segundo_apellido', 'role']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    # No validamos dominio aquí

    def validate_password(self, value):
        """Validar que la contraseña cumpla con los requisitos."""
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra mayúscula.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("La contraseña debe contener al menos una letra minúscula.")
        if not re.search(r'\d', value):
            raise serializers.ValidationError("La contraseña debe contener al menos un número.")
        if len(value) < 8:
            raise serializers.ValidationError("La contraseña debe tener al menos 8 caracteres.")
        return value

    def validate_nombres(self, value):
        """Validar que los nombres solo contengan letras y espacios."""
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$', value):
            raise serializers.ValidationError("El campo 'nombres' solo puede contener letras y espacios.")
        return value

    def validate_primer_apellido(self, value):
        """Validar que el primer apellido solo contenga letras y guiones."""
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\-]+$', value):
            raise serializers.ValidationError("El campo 'primer_apellido' solo puede contener letras y guiones.")
        return value

    def validate_segundo_apellido(self, value):
        """Validar que el segundo apellido solo contenga letras y guiones."""
        if not re.match(r'^[a-zA-ZáéíóúÁÉÍÓÚñÑ\-]+$', value):
            raise serializers.ValidationError("El campo 'segundo_apellido' solo puede contener letras y guiones.")
        return value

    def validate(self, data):
        """Validar que las contraseñas coincidan."""
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({"password": "Las contraseñas no coinciden."})
        return data

    def create(self, validated_data):
        validated_data.pop('confirm_password')
        validated_data['password'] = make_password(validated_data['password'])
        validated_data['role'] = 'empresa'
        return Usuario.objects.create(**validated_data)
