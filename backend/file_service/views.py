from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login
from django.core.files.uploadedfile import UploadedFile

from .models import Directory, File, User

# Create your views here.

from django.http import HttpRequest, HttpResponse, JsonResponse
from rest_framework import serializers, viewsets


def login_required(func):
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponse(status=401)
        return func(request, *args, **kwargs)

    return wrapper


import json


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "root_directory"]

    root_directory = serializers.PrimaryKeyRelatedField(read_only=True)


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


class DirectoryBasicSerializer(serializers.ModelSerializer):
    class Meta:
        model = Directory
        fields = ["id", "name", "parent"]

    parent = serializers.PrimaryKeyRelatedField(read_only=True)


class DirectorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Directory
        fields = ["id", "user", "name", "parent", "children", "files", "path"]

    user = serializers.PrimaryKeyRelatedField(read_only=True)

    parent = DirectoryBasicSerializer(read_only=True)
    children = DirectoryBasicSerializer(read_only=True, many=True)
    files = FileSerializer(read_only=True, many=True)
    path = serializers.SerializerMethodField()

    def get_path(self, obj: Directory):
        return DirectoryBasicSerializer(obj.get_path(), read_only=True, many=True).data


class DirectoryViewSet(viewsets.ModelViewSet):
    queryset = Directory.objects.all()
    serializer_class = DirectorySerializer


@login_required
def user(request: HttpRequest) -> JsonResponse:
    return JsonResponse(UserSerializer(request.user).data)


@csrf_exempt
def do_login(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    username: str = data["username"]
    password: str = data["password"]
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return HttpResponse("OK")
    else:
        return HttpResponse("Unauthorized", status=401)


@login_required
def upload(request: HttpRequest) -> HttpResponse:
    file: UploadedFile = request.FILES["file"]
    file_name = file.name
    file_size = file.size
    directory_id = int(request.POST["directory"])
    directory: Directory = Directory.objects.get(pk=directory_id)
    file_instance = File(
        user=request.user, name=file_name, size=file_size, directory=directory
    )
    file_instance.file_ref.save(file_name, file)
    file_instance.save()
    return HttpResponse("File uploaded successfully")


def download(request: HttpRequest, file_id) -> HttpResponse:
    file = File.objects.get(pk=file_id)
    response = HttpResponse(file.file_ref)
    response["Content-Disposition"] = "attachment; filename=%s" % file.name
    return response


def delete_file(request: HttpRequest) -> HttpResponse:
    file = File.objects.get(pk=int(json.loads(request.body)["file"]))
    if file.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    file.file_ref.delete()
    file.delete()
    return HttpResponse("File deleted successfully")


def delete_directory(request: HttpRequest) -> HttpResponse:
    directory: Directory = Directory.objects.get(
        pk=int(json.loads(request.body)["directory"])
    )
    if directory.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    files = File.objects.filter(directory=directory)
    for file in files:
        file.file_ref.delete()
        file.delete()
    directory.delete()
    return HttpResponse("Directory deleted successfully")


def get_directory(request: HttpRequest, directory_id) -> JsonResponse:
    directory: Directory = Directory.objects.get(pk=directory_id)
    return JsonResponse(DirectorySerializer(directory).data)


def create_directory(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    name: str = data["name"]
    parent_id: int = data["parent"]
    parent: Directory = Directory.objects.get(pk=parent_id)
    if parent.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    directory = Directory(user=request.user, name=name, parent=parent)
    directory.save()
    return HttpResponse("Directory created successfully")
