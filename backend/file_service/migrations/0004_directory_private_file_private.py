# Generated by Django 4.1.3 on 2023-01-03 21:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("file_service", "0003_alter_file_directory"),
    ]

    operations = [
        migrations.AddField(
            model_name="directory",
            name="private",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="file",
            name="private",
            field=models.BooleanField(default=True),
        ),
    ]
