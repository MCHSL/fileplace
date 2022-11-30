from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.files.storage import FileSystemStorage
import hashlib

from mptt.models import MPTTModel, TreeForeignKey


class User(AbstractUser):
    root_directory = models.OneToOneField(
        "Directory", on_delete=models.CASCADE, related_name="root_for", null=True
    )

    def save(self, *args, **kwargs):
        if not self.pk:
            super(User, self).save(*args, **kwargs)
            root_directory = Directory(name="root", user=self)
            root_directory.save()
            self.root_directory = root_directory
        super(User, self).save(*args, **kwargs)


def upload_location(instance, filename):
    hasher = hashlib.md5()
    hasher.update(filename.encode("utf-8"))
    digest = hasher.hexdigest()

    return f"{digest[0]}/{digest[1]}/{digest}"


class Directory(MPTTModel):
    name = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="directories")
    parent = TreeForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )

    def get_path(self):
        return self.get_ancestors(include_self=True)


class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")
    directory = models.ForeignKey(
        Directory, on_delete=models.CASCADE, related_name="files", null=True, blank=True
    )
    name = models.TextField()
    size = models.IntegerField()

    file_ref = models.FileField(upload_to=upload_location)

    def get_file_url(self):
        return upload_location(self, self.name)

    def __str__(self):
        directory = self.directory.get_path() if self.directory else "/"
        return f"{self.name} ({self.size} bytes) in {directory}, located at {self.get_file_url()}"
