from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login

from .models import Directory, File, User

# Create your views here.

from django.http import HttpResponse, JsonResponse
from rest_framework import serializers, viewsets

# Serializers define the API representation.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "root_directory"]

    root_directory = serializers.SerializerMethodField()

    def get_root_directory(self, obj):
        return DirectorySerializer(obj.root_directory).data


# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ["id", "user", "name", "size"]

    user = serializers.PrimaryKeyRelatedField(read_only=True)


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer


class DirectorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Directory
        fields = ["id", "user", "name", "parent", "children"]

    user = serializers.PrimaryKeyRelatedField(read_only=True)

    parent = serializers.PrimaryKeyRelatedField(queryset=Directory.objects.all())
    children = serializers.PrimaryKeyRelatedField(read_only=True, many=True)


class DirectoryViewSet(viewsets.ModelViewSet):
    queryset = Directory.objects.all()
    serializer_class = DirectorySerializer


def do_login(request):
    username = request.POST["username"]
    password = request.POST["password"]
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return HttpResponse("OK")
    else:
        return HttpResponse("Failed")


@csrf_exempt
def upload(request):
    file = request.FILES["file"]
    file_name = file.name
    file_size = file.size
    user = User.objects.get(pk=1)
    directory = Directory(name="test", user=user)
    directory.save()
    file_instance = File(user=user, name=file_name, size=file_size, directory=directory)
    file_instance.file_ref.save(file_name, file)
    file_instance.save()
    return HttpResponse("File uploaded successfully")


def __get_directory_structure(directory):
    directory_structure = {
        "name": directory.name,
        "path": directory.get_path(),
        "children": [],
    }
    for child in directory.children.all():
        directory_structure["children"].append(__get_directory_structure(child))
    return directory_structure


def get_directory_structure(request, user):
    user = User.objects.get(pk=user)
    directory_structure = __get_directory_structure(user.root_directory)
    return JsonResponse(directory_structure)


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")
