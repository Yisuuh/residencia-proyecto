from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator, MinValueValidator, MaxValueValidator
from django.utils.translation import gettext_lazy as _
from .validations import validate_image_size

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("El email es obligatorio")
        email = self.normalize_email(email)
        extra_fields.setdefault('role', 'alumno')
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):
    ROLE_CHOICES = [
        ('alumno', 'Alumno'),
        ('jefe_carrera', 'Jefe de Carrera'),
        ('coordinador', 'Coordinador'),
        ('empresa', 'Empresa'),
        ('presidente_academia', 'Presidente de Academia'),
    ]

    ESPECIALIDAD_CHOICES = [
        ('desarrollo_web', 'Desarrollo Web'),
        ('ciberseguridad', 'Ciberseguridad'),
        ('ia', 'Inteligencia Artificial'),
    ]

    # ✅ NUEVO: Opciones de sexo
    SEXO_CHOICES = [
        ('masculino', 'Masculino'),
        ('femenino', 'Femenino'),
    ]

    INGRESO_CHOICES = [(str(i), str(i)) for i in range(1, 13)] + [('12+', '12+')]

    email = models.EmailField(unique=True)
    nombres = models.CharField(max_length=100)
    primer_apellido = models.CharField(max_length=50)
    segundo_apellido = models.CharField(max_length=50)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='alumno')
    
    # ✅ NUEVO: Campo sexo
    sexo = models.CharField(
        max_length=10,
        choices=SEXO_CHOICES,
        blank=True,  # ✅ Opcional para usuarios existentes
        null=True    # ✅ Permitir NULL en BD
    )
    
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_profile_complete = models.BooleanField(default=False)

    matricula = models.CharField(
        max_length=10,
        validators=[RegexValidator(regex=r'^E', message="La matrícula debe comenzar con la letra 'E'.")],
        blank=True,
        null=True
    )
    especialidad = models.CharField(
        max_length=50,
        choices=ESPECIALIDAD_CHOICES,
        blank=True,
        null=True
    )
    ingreso = models.CharField(
        max_length=3,
        choices=INGRESO_CHOICES,
        blank=True,
        null=True
    )
    telefono = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\d{10}$', message="El número de teléfono debe tener 10 dígitos.")],
        blank=True,
        null=True
    )

    def user_directory_path(instance, filename):
        return f'usuarios/{instance.id}/{filename}'

    foto = models.ImageField(
        upload_to=user_directory_path,
        blank=True,
        null=True,
        validators=[validate_image_size]
    )

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombres', 'primer_apellido', 'segundo_apellido']

    objects = UsuarioManager()

    def clean(self):
        super().clean()
        if self.role == 'alumno':
            valid_domains = ['@merida.tecnm.mx', '@itmerida.edu.mx']
            if not any(self.email.endswith(domain) for domain in valid_domains):
                raise ValidationError(f"El email debe tener una de las siguientes terminaciones: {', '.join(valid_domains)}")

    def __str__(self):
        return f"{self.nombres} {self.primer_apellido} {self.segundo_apellido} ({self.email})"
