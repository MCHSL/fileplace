from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login

from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.views.decorators.vary import vary_on_cookie, vary_on_headers

from .models import Directory, File, User

# Create your views here.

from django.http import HttpResponse, JsonResponse
from rest_framework import serializers, viewsets
from django.contrib.auth.decorators import login_required

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
def user(request):
    return JsonResponse(UserSerializer(request.user).data)


@csrf_exempt
def do_login(request):
    data = json.loads(request.body)
    username = data["username"]
    password = data["password"]
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        return HttpResponse("OK")
    else:
        return HttpResponse("Unauthorized", status=401)


@login_required
def upload(request):
    file = request.FILES["file"]
    file_name = file.name
    file_size = file.size
    directory = int(request.POST["directory"])
    directory = Directory.objects.get(pk=directory)
    file_instance = File(
        user=request.user, name=file_name, size=file_size, directory=directory
    )
    file_instance.file_ref.save(file_name, file)
    file_instance.save()
    return HttpResponse("File uploaded successfully")


def get_directory(request, directory_id):
    directory = Directory.objects.get(pk=directory_id)
    return JsonResponse(DirectorySerializer(directory).data)


def create_directory(request):
    data = json.loads(request.body)
    name = data["name"]
    parent = data["parent"]
    parent = Directory.objects.get(pk=parent)
    if parent.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    directory = Directory(user=request.user, name=name, parent=parent)
    directory.save()
    return HttpResponse("Directory created successfully")


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")
