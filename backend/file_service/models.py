from django.db import models
from django.contrib.auth.models import AbstractUser
import hashlib


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

    return f"{instance.user.pk}/{digest[0]}/{digest[1]}/{digest}"


class Directory(models.Model):
    name = models.TextField()
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="directories")
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )

    def get_path(self):
        path_parts = [self.name]
        parent = self.parent
        while parent:
            path_parts.append(parent.name)
            parent = parent.parent
        return "/".join(reversed(path_parts))


class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")
    directory = models.ForeignKey(
        Directory, on_delete=models.CASCADE, related_name="files", null=True, blank=True
    )
    name = models.TextField()
    size = models.IntegerField()

    file_ref = models.FileField(upload_to="files")

    def get_file_url(self):
        return upload_location(self, self.name)

    def __str__(self):
        directory = self.directory.get_path() if self.directory else "/"
        return f"{self.name} ({self.size} bytes) in {directory}, located at {self.get_file_url()}"
