from typing import List
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.core.files.uploadedfile import UploadedFile
from django.views.decorators.http import require_POST, require_safe
from django.core.cache import cache

from .models import Directory, File, User
from .decorators import login_required

# Create your views here.

from django.http import HttpRequest, HttpResponse, JsonResponse
from rest_framework import serializers


import json


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "root_directory"]

    root_directory = serializers.PrimaryKeyRelatedField(read_only=True)


class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ["id", "user", "name", "size", "directory", "path"]

    user = serializers.PrimaryKeyRelatedField(read_only=True)
    directory = serializers.PrimaryKeyRelatedField(read_only=True)
    path = serializers.SerializerMethodField()

    def get_path(self, obj: File):
        directory: Directory = obj.directory  # type: ignore
        return DirectoryBasicSerializer(
            directory.get_path(), read_only=True, many=True
        ).data


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


@login_required
def user(request: HttpRequest) -> JsonResponse:
    data = cache.get_or_set(
        f"user:{request.user.pk}", lambda: UserSerializer(request.user).data
    )
    return JsonResponse(data)


@csrf_exempt
@require_POST
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


@require_POST
def do_logout(request: HttpRequest) -> HttpResponse:
    logout(request)
    return HttpResponse("OK")


@login_required
@require_POST
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
    return HttpResponse(FileSerializer(file_instance).data)


@require_safe
def download(request: HttpRequest, file_id) -> HttpResponse:
    file = File.objects.get(pk=file_id)
    response = HttpResponse(file.file_ref)
    response["Content-Disposition"] = "attachment; filename=%s" % file.name
    return response


@login_required
@require_POST
def delete_files(request: HttpRequest) -> HttpResponse:
    errors = []
    file_ids = json.loads(request.body)["files"]

    for file in File.objects.filter(pk__in=map(int, file_ids)):
        if file.user != request.user:
            errors.append(f"File {file.name} does not belong to user {request.user}")
            continue
        file.file_ref.delete()
        file.delete()
    if not errors:
        return HttpResponse("Files deleted successfully")
    else:
        return HttpResponse(errors, status=400)


@login_required
@require_POST
def move_files(request: HttpRequest) -> HttpResponse:
    errors = []
    req = json.loads(request.body)
    file_ids = req["files"]
    directory_id = req["directory"]
    directory = Directory.objects.get(pk=directory_id)

    for file in File.objects.filter(pk__in=map(int, file_ids)):
        if file.user != request.user:
            errors.append(f"File {file.name} does not belong to user {request.user}")
            continue
        file.directory = directory
        file.save()
    if not errors:
        return HttpResponse("Files moved successfully")
    else:
        return HttpResponse(errors, status=400)


@require_POST
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


@require_safe
def get_directory(request: HttpRequest, directory_id) -> JsonResponse:
    directory: Directory = Directory.objects.get(pk=directory_id)
    return JsonResponse(DirectorySerializer(directory).data)


@login_required
@require_POST
def create_directory(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    name: str = data["name"]
    parent_id: int = data["parent"]
    parent: Directory = Directory.objects.get(pk=parent_id)
    if parent.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    directory = Directory(user=request.user, name=name, parent=parent)
    directory.save()
    return JsonResponse(DirectorySerializer(directory).data)


@login_required
@require_POST
def move_directory(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    directory_id = data["directory"]
    parent_id = data["parent"]
    directory: Directory = Directory.objects.get(pk=directory_id)
    parent: Directory = Directory.objects.get(pk=parent_id)
    if directory.user != request.user or parent.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    directory.parent = parent
    directory.save()
    return JsonResponse(DirectorySerializer(directory).data)


@login_required
@require_safe
def search_files(request: HttpRequest) -> HttpResponse:
    query = request.GET["query"]
    if len(query) < 3:
        return HttpResponse("Query must be at least 3 characters long", status=400)

    files = File.objects.filter(user=request.user, name__icontains=query)
    result = {
        "files": FileSerializer(files, many=True).data,
    }
    return JsonResponse(result, safe=False)
