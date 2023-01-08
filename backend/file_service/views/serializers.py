from rest_framework import serializers
from ..models import Directory, File, User
from django.core.cache import cache
from .users import UserSerializer


class DirectoryBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Directory
        fields = ["id", "name", "parent", "user", "private"]

    parent = serializers.PrimaryKeyRelatedField(read_only=True)
    user = UserSerializer(read_only=True)


class DirectorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Directory
        fields = [
            "id",
            "user",
            "name",
            "parent",
            "children",
            "files",
            "path",
            "private",
        ]

    user = UserSerializer(read_only=True)

    parent = DirectoryBasicSerializer(read_only=True)
    children = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    path = serializers.SerializerMethodField()

    def get_path(self, obj: Directory):
        return DirectoryBasicSerializer(obj.get_path(), read_only=True, many=True).data

    def get_children(self, obj: Directory):
        user: User = self.context.get("request").user  # type: ignore
        if user.is_staff or user == obj.user:  # type: ignore
            return cache.get_or_set(f"children:{obj.pk}", lambda: DirectoryBasicSerializer(obj.children.all(), read_only=True, many=True).data)  # type: ignore
        else:
            return DirectoryBasicSerializer(obj.children.filter(private=False), read_only=True, many=True).data  # type: ignore

    def get_files(self, obj: Directory):
        user: User = self.context.get("request").user  # type: ignore
        if user.is_staff or user == obj.user:  # type: ignore
            return cache.get_or_set(f"files:{obj.pk}", lambda: FileSerializer(obj.files.all(), read_only=True, many=True).data)  # type: ignore
        else:
            return FileSerializer(obj.files.filter(private=False), read_only=True, many=True).data  # type: ignore


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ["id", "user", "name", "size", "directory", "path", "private"]

    directory = DirectoryBasicSerializer(read_only=True)
    path = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)

    def get_path(self, obj: File):
        directory: Directory = obj.directory  # type: ignore
        return DirectoryBasicSerializer(
            directory.get_path(), read_only=True, many=True
        ).data
