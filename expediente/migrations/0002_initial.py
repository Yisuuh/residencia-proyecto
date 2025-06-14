# Generated by Django 5.2 on 2025-06-01 05:56

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('expediente', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name='documento',
            name='alumno',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documentos', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='documento',
            name='documento_predefinido',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='documentos', to='expediente.documentopredefinido'),
        ),
    ]
