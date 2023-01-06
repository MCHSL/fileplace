from typing import List
from django.conf import settings
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate, login, logout
from django.core.files.uploadedfile import UploadedFile
from django.views.decorators.http import require_POST, require_safe
from django.core.cache import cache
import requests

from .models import Directory, File, User
from .decorators import login_required

# Create your views here.

from django.http import Http404, HttpRequest, HttpResponse, JsonResponse
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
        fields = ["id", "user", "name", "size", "directory", "path", "private"]

    directory = serializers.PrimaryKeyRelatedField(read_only=True)
    path = serializers.SerializerMethodField()
    user = UserSerializer(read_only=True)

    def get_path(self, obj: File):
        directory: Directory = obj.directory  # type: ignore
        return DirectoryBasicSerializer(
            directory.get_path(), read_only=True, many=True
        ).data


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
        if self.context.get("request").user == obj.user:  # type: ignore
            return cache.get_or_set(f"children:{obj.pk}", lambda: DirectoryBasicSerializer(obj.children.all(), read_only=True, many=True).data)  # type: ignore
        else:
            return DirectoryBasicSerializer(obj.children.filter(private=False), read_only=True, many=True).data  # type: ignore

    def get_files(self, obj: Directory):
        if self.context.get("request").user == obj.user:  # type: ignore
            return cache.get_or_set(f"files:{obj.pk}", lambda: FileSerializer(obj.files.all(), read_only=True, many=True).data)  # type: ignore
        else:
            return FileSerializer(obj.files.filter(private=False), read_only=True, many=True).data  # type: ignore


@login_required
def user(request: HttpRequest) -> JsonResponse:
    data = cache.get_or_set(
        f"user:{request.user.pk}", lambda: UserSerializer(request.user).data
    )
    return JsonResponse(data)


@csrf_exempt
@require_POST
def oauth_login(request: HttpRequest, provider: str) -> HttpResponse:
    if provider != "google":
        return HttpResponse("Invalid provider", status=400)

    data = json.loads(request.body)
    print(data)

    token = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": data["code"],
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "redirect_uri": "postmessage",
            "grant_type": "authorization_code",
        },
    ).json()["access_token"]

    email = requests.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        headers={"Authorization": f"Bearer {token}"},
    ).json()["email"]

    user = User.objects.filter(email=email).first()
    if user:
        login(request, user)
        return HttpResponse("OK")

    user = User(username=None, email=email, oauth_provider=provider)
    user.set_unusable_password()
    user.save()
    login(request, user)

    return HttpResponse("OK")


@require_POST
def set_username(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    username: str = data["username"]
    if User.objects.filter(username=username).exists():
        return HttpResponse("Username already exists", status=400)
    request.user.username = username  # type: ignore
    request.user.save()
    return HttpResponse("OK")


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


@csrf_exempt
@require_POST
def register(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    username: str = data["username"]
    password: str = data["password"]
    email: str = data["email"]
    if User.objects.filter(username=username).exists():
        return HttpResponse("Username already exists", status=400)
    if User.objects.filter(email=email).exists():
        return HttpResponse("Email already exists", status=400)
    if not username or not password or not email:
        return HttpResponse("Username, password or email cannot be empty", status=400)

    if not username.isalnum():
        return HttpResponse("Username must be alphanumeric", status=400)

    if len(password) < 10:
        return HttpResponse("Password must be at least 10 characters long", status=400)

    if not any(char.isdigit() for char in password):
        return HttpResponse("Password must contain at least one digit", status=400)

    if not any(char.isupper() for char in password):
        return HttpResponse(
            "Password must contain at least one uppercase letter", status=400
        )

    if not any(char.islower() for char in password):
        return HttpResponse(
            "Password must contain at least one lowercase letter", status=400
        )

    if not any(not char.isalnum() for char in password):
        return HttpResponse(
            "Password must contain at least one special character", status=400
        )

    user = User(username=username, email=email)
    user.set_password(password)
    user.save()
    return HttpResponse("OK")


@require_safe
def check_username(request: HttpRequest, username: str) -> JsonResponse:
    return JsonResponse({"exists": User.objects.filter(username=username).exists()})


@require_safe
def get_user(request: HttpRequest, username: str) -> JsonResponse:
    cached = cache.get(f"user:username:{username}")
    if cached:
        return JsonResponse(cached)
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        raise Http404()
    serialized = UserSerializer(user).data
    if not request.user.is_staff:  # type: ignore
        serialized["email"] = "<redacted>"
    cache.set(f"user:username:{username}", serialized)
    return JsonResponse(serialized)


@login_required
@require_POST
def upload(request: HttpRequest) -> HttpResponse:
    directory_id = int(request.POST["directory"])
    directory: Directory = Directory.objects.get(pk=directory_id)  # type: ignore
    if directory.user != request.user:
        raise Http404()
    file: UploadedFile = request.FILES["file"]
    file_name = file.name
    file_size = file.size

    if File.objects.filter(directory=directory, name=file_name).exists():
        return HttpResponse("File already exists", status=400)

    file_instance = File(
        user=request.user, name=file_name, size=file_size, directory=directory
    )
    file_instance.file_ref.save(file_name, file)
    file_instance.save()
    cache.delete(f"files:{directory.pk}")
    return HttpResponse(FileSerializer(file_instance).data)


@require_safe
def download(request: HttpRequest, file_id) -> HttpResponse:
    file = File.objects.get(pk=file_id)
    if file.private and file.user != request.user:
        raise Http404()

    if settings.DEBUG:
        response = HttpResponse(file.file_ref)
        response["Content-Disposition"] = "attachment; filename=%s" % file.name
        return response

    response = HttpResponse()
    response["X-Accel-Redirect"] = f"/protected/{file.file_ref.name}"
    response["Content-Disposition"] = "attachment; filename=%s" % file.name
    return response


@login_required
@require_POST
def delete_files(request: HttpRequest) -> HttpResponse:
    errors = []
    file_ids = json.loads(request.body)["files"]

    directory_ids = set()

    for file in File.objects.filter(pk__in=map(int, file_ids)):
        if file.user != request.user:
            errors.append(f"File {file.name} does not belong to user {request.user}")
            continue
        directory_ids.add(file.directory.pk)  # type: ignore
        file.file_ref.delete()
        file.delete()

    cache.delete_many([f"files:{directory_id}" for directory_id in directory_ids])

    if not errors:
        return HttpResponse("Files deleted successfully")
    else:
        return HttpResponse(errors, status=400)


@login_required
@require_POST
def move_files(request: HttpRequest) -> HttpResponse:
    errors = []
    req = json.loads(request.body)
    file_ids = map(int, req["files"])
    directory_id = req["directory"]
    directory = Directory.objects.get(pk=directory_id)

    former_directory_ids = set()

    for file in File.objects.filter(pk__in=file_ids):
        if file.user != request.user:
            errors.append(f"File {file.name} does not belong to user {request.user}")
            continue
        former_directory_ids.add(file.directory.pk)  # type: ignore
        file.directory = directory
        file.save()

    cache.delete_many([f"files:{pk}" for pk in former_directory_ids])
    cache.delete(f"files:{directory.pk}")  # type: ignore

    if not errors:
        return HttpResponse("Files moved successfully")
    else:
        return HttpResponse(errors, status=400)


@login_required
@require_POST
def rename_file(request: HttpRequest) -> HttpResponse:
    req = json.loads(request.body)
    file_id = req["file"]
    new_name = req["name"]
    file = File.objects.get(pk=file_id)
    if file.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    file.name = new_name
    file.save()
    cache.delete(f"files:{file.directory.pk}")  # type: ignore
    return HttpResponse("File renamed successfully")


@login_required
@require_POST
def set_file_private(request: HttpRequest) -> HttpResponse:
    req = json.loads(request.body)
    file_id = req["file"]
    private = req["private"]
    file = File.objects.get(pk=file_id)
    if file.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    file.set_private(private)
    cache.delete(f"files:{file.directory.pk}")  # type: ignore
    return HttpResponse("File set to private successfully")


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
    cache.delete(f"children:{directory.pk}")
    cache.delete(f"files:{directory.pk}")
    return HttpResponse("Directory deleted successfully")


@require_safe
def get_directory(request: HttpRequest, directory_id: int) -> JsonResponse:
    directory: Directory = Directory.objects.get(pk=directory_id)
    if directory.private and directory.user != request.user:
        raise Http404()

    return JsonResponse(
        DirectorySerializer(
            directory,
            context={"request": request},
        ).data
    )


@login_required
@require_POST
def create_directory(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    name: str = data["name"]
    parent_id: int = data["parent"]
    parent: Directory = Directory.objects.get(pk=parent_id)
    if parent.user != request.user:
        return HttpResponse("Unauthorized", status=401)

    if Directory.objects.filter(name=name, parent=parent).exists():
        return HttpResponse("Directory already exists", status=400)

    directory = Directory(user=request.user, name=name, parent=parent)
    directory.save()
    cache.delete(f"children:{parent.pk}")
    return JsonResponse(
        DirectorySerializer(directory, context={"request": request}).data
    )


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

    cache.delete(f"children:{directory.parent.pk}")
    cache.delete(f"children:{parent.pk}")
    directory.parent = parent
    directory.save()
    return JsonResponse(
        DirectorySerializer(directory, context={"request": request}).data
    )


@login_required
@require_POST
def rename_directory(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    directory_id = data["directory"]
    new_name = data["name"]
    directory: Directory = Directory.objects.get(pk=directory_id)
    if directory.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    directory.name = new_name
    directory.save()
    cache.delete(f"children:{directory.parent.pk}")
    return HttpResponse("Directory renamed successfully")


@login_required
@require_POST
def set_directory_private(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    directory_id = data["directory"]
    private = data["private"]
    directory: Directory = Directory.objects.get(pk=directory_id)
    if directory.user != request.user:
        return HttpResponse("Unauthorized", status=401)
    directory.set_private(private)
    cache.delete(f"children:{directory.parent.pk}")
    return HttpResponse("Directory set to private successfully")


@require_POST
def find_directory(request: HttpRequest) -> JsonResponse:
    data = json.loads(request.body)
    path: List[str] = data["path"]
    root_directory: int = data["root_directory"]

    root = Directory.objects.get(pk=root_directory)
    result = root.follow_path(path)
    return JsonResponse(DirectorySerializer(result, context={"request": request}).data)


@require_safe
def search(request: HttpRequest) -> HttpResponse:
    username = request.GET.get("username")
    if not username:
        return HttpResponse("Username must be specified", status=400)
    query = request.GET.get("query")
    if not query:
        return HttpResponse("Query must be specified", status=400)

    user = User.objects.get(username=username)
    if user == request.user:
        files = File.objects.filter(user=user, name__icontains=query)
        directories = Directory.objects.filter(user=user, name__icontains=query)
    else:
        files = File.objects.filter(user=user, name__icontains=query, private=False)
        directories = Directory.objects.filter(
            user=user, name__icontains=query, private=False
        )

    result = {
        "files": FileSerializer(files, many=True).data,
        "directories": DirectoryBasicSerializer(directories, many=True).data,
    }
    return JsonResponse(result, safe=False)
