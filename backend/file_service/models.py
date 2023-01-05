import hashlib

from django.contrib.auth.models import AbstractUser
from django.db import models
from mptt.models import MPTTModel, TreeForeignKey
from django.core.cache import cache


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
    private = models.BooleanField(default=True)

    def get_path(self):
        return self.get_ancestors(include_self=True)

    def follow_path(self, path):
        if not path:
            return self
        else:
            return self.children.get(name=path[0]).follow_path(path[1:])  # type: ignore

    def set_private(self, private):
        self.private = private
        self.save()


class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="files")
    directory = models.ForeignKey(
        Directory, on_delete=models.CASCADE, related_name="files", null=False
    )
    name = models.TextField()
    size = models.BigIntegerField()
    private = models.BooleanField(default=True)

    file_ref = models.FileField(upload_to=upload_location)

    def set_private(self, private):
        self.private = private
        self.save()

    def save(self, *args, **kwargs):
        if not self.pk:
            if not self.directory:
                self.directory = self.user.root_directory
        super(File, self).save(*args, **kwargs)

    def get_file_url(self):
        return upload_location(self, self.name)

    def __str__(self):
        directory = self.directory.get_path() if self.directory else "/"
        return f"{self.name} ({self.size} bytes) in {directory}, located at {self.get_file_url()}"
