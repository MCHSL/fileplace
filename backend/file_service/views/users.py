import json
from django.http import HttpRequest, HttpResponse, JsonResponse
import requests

from ..decorators import login_required
from ..models import User
from rest_framework import serializers
from django.core.cache import cache
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST, require_safe
from django.contrib.auth import login, logout, authenticate
from django.conf import settings
from django.shortcuts import get_object_or_404


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "root_directory"]

    root_directory = serializers.PrimaryKeyRelatedField(read_only=True)


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
@login_required
def set_username(request: HttpRequest) -> HttpResponse:
    if request.user.username is not None:  # type: ignore
        return HttpResponse("Username already set", status=400)
    data = json.loads(request.body)
    username: str = data["username"]
    if User.objects.filter(username=username).exists():
        return HttpResponse("Username already exists", status=400)
    request.user.username = username  # type: ignore
    request.user.save()
    cache.delete(f"user:{request.user.pk}")
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

    user = get_object_or_404(User, username=username)
    serialized = UserSerializer(user).data
    if not request.user.is_staff:  # type: ignore
        serialized["email"] = "<redacted>"

    cache.set(f"user:username:{username}", serialized)
    return JsonResponse(serialized)
