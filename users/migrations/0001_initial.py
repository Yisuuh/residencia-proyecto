# Generated by Django 5.2 on 2025-06-01 05:56

import django.core.validators
import users.models
import users.validations
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Usuario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('email', models.EmailField(max_length=254, unique=True)),
                ('nombres', models.CharField(max_length=100)),
                ('primer_apellido', models.CharField(max_length=50)),
                ('segundo_apellido', models.CharField(max_length=50)),
                ('role', models.CharField(choices=[('alumno', 'Alumno'), ('jefe_carrera', 'Jefe de Carrera'), ('coordinador', 'Coordinador'), ('empresa', 'Empresa'), ('presidente_academia', 'Presidente de Academia')], default='alumno', max_length=20)),
                ('is_active', models.BooleanField(default=True)),
                ('is_staff', models.BooleanField(default=False)),
                ('is_superuser', models.BooleanField(default=False)),
                ('is_profile_complete', models.BooleanField(default=False)),
                ('matricula', models.CharField(max_length=10, validators=[django.core.validators.RegexValidator(message="La matrícula debe comenzar con la letra 'E'.", regex='^E')])),
                ('especialidad', models.CharField(choices=[('desarrollo_web', 'Desarrollo Web'), ('ciberseguridad', 'Ciberseguridad'), ('ia', 'Inteligencia Artificial')], max_length=50)),
                ('ingreso', models.CharField(choices=[('1', '1'), ('2', '2'), ('3', '3'), ('4', '4'), ('5', '5'), ('6', '6'), ('7', '7'), ('8', '8'), ('9', '9'), ('10', '10'), ('11', '11'), ('12', '12'), ('12+', '12+')], max_length=3)),
                ('telefono', models.CharField(max_length=15, validators=[django.core.validators.RegexValidator(message='El número de teléfono debe tener 10 dígitos.', regex='^\\d{10}$')])),
                ('foto', models.ImageField(upload_to=users.models.Usuario.user_directory_path, validators=[users.validations.validate_image_size])),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
    ]
