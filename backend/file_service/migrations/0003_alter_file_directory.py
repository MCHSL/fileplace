# Generated by Django 4.1.3 on 2022-12-07 22:55

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("file_service", "0002_alter_file_size"),
    ]

    operations = [
        migrations.AlterField(
            model_name="file",
            name="directory",
            field=models.ForeignKey(
                default=0,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="files",
                to="file_service.directory",
            ),
            preserve_default=False,
        ),
    ]
