from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt

from .models import Directory, File, User

# Create your views here.

from django.http import HttpResponse
from rest_framework import serializers, viewsets

# Serializers define the API representation.
class UserSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = User
        fields = ["url", "username", "email", "is_staff"]


# ViewSets define the view behavior.
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class FileSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = File
        fields = ["user", "url", "name", "size"]

    user = UserSerializer()


class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer


class DirectorySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Directory
        fields = ["user", "url", "name", "parent"]

    parent = serializers.HyperlinkedRelatedField(
        view_name="directory-detail", read_only=True
    )


class DirectoryViewSet(viewsets.ModelViewSet):
    queryset = Directory.objects.all()
    serializer_class = DirectorySerializer


def create_user(request):
    user = User(username="test", email="test@examepl.com")
    user.set_password("123")
    user.save()
    return HttpResponse("User created")


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


def index(request):
    return HttpResponse("Hello, world. You're at the polls index.")
