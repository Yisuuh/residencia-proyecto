from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

@admin.register(Usuario)
class CustomUsuarioAdmin(UserAdmin):
    model = Usuario
    list_display = ("email", "nombres", "primer_apellido", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_active")
    search_fields = ("email", "nombres", "primer_apellido")
    ordering = ("email",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Información personal", {"fields": ("nombres", "primer_apellido", "segundo_apellido", "matricula", "especialidad", "ingreso", "telefono", "foto")}),
        ("Permisos", {"fields": ("role", "is_staff", "is_active", "is_superuser", "groups", "user_permissions")}),
        ("Fechas importantes", {"fields": ("last_login",)}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "nombres", "primer_apellido", "segundo_apellido", "matricula", "especialidad", "ingreso", "telefono", "foto", "password1", "password2", "role", "is_staff", "is_active", "is_superuser", "groups", "user_permissions"),
        }),
    )
