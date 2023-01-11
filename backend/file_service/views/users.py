import json
from typing import Optional, Union
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
from django.utils.crypto import get_random_string
from django.core.mail import send_mail
from django.core.mail import EmailMultiAlternatives


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "root_directory"]

    root_directory = serializers.PrimaryKeyRelatedField(read_only=True)
    email = serializers.SerializerMethodField()

    def get_email(self, user: User) -> Optional[str]:
        if (
            self.context["request"].user == user
            or self.context["request"].user.is_staff
        ):
            return user.email
        return None


class PasswordResetToken:
    def __init__(self, user: User, token: Optional[str] = None):
        self.user = user
        self.token = token if token else get_random_string(64)

    def save(self):
        cache.set(f"reset_token:{self.token}:user", self.user.pk, timeout=60 * 60)
        cache.set(f"user:{self.user.pk}:reset_token", self.token, timeout=60 * 60)

    def delete(self):
        cache.delete(f"reset_token:{self.token}:user")
        cache.delete(f"user:{self.user.pk}:token")

    @classmethod
    def get(cls, token: str) -> Optional["PasswordResetToken"]:
        user_pk = cache.get(f"reset_token:{token}:user")
        if user_pk:
            return cls(User.objects.get(pk=user_pk), token)


@login_required
def user(request: HttpRequest) -> JsonResponse:
    return JsonResponse(
        UserSerializer(
            request.user,
            context={"request": request},
        ).data
    )


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
        if not user.is_active:
            return HttpResponse("The account is disabled.", status=401)
        if user.verification_token:  # type: ignore
            return HttpResponse(
                "The account's email address has not been verified yet.", status=401
            )
        login(request, user)
        return HttpResponse("OK")
    else:
        return HttpResponse("Incorrect username or password.", status=401)


@require_POST
def do_logout(request: HttpRequest) -> HttpResponse:
    logout(request)
    return HttpResponse("OK")


def validate_password(password: str) -> Union[str, None]:
    if len(password) < 10:
        return "Password must be at least 10 characters long"

    if not any(char.isdigit() for char in password):
        return "Password must contain at least one digit"

    if not any(char.isupper() for char in password):
        return "Password must contain at least one uppercase letter"

    if not any(char.islower() for char in password):
        return "Password must contain at least one lowercase letter"

    if not any(not char.isalnum() for char in password):
        return "Password must contain at least one special character"

    return None


@csrf_exempt
@require_POST
def register(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    username: str = data["username"]
    password: str = data["password"]
    email: str = data["email"]
    if User.objects.filter(username=username).exists():
        return HttpResponse("Username already exists", status=400)
    if not username or not password or not email:
        return HttpResponse("Username, password or email cannot be empty", status=400)
    if not username.isalnum():
        return HttpResponse("Username must be alphanumeric", status=400)

    pass_result = validate_password(password)
    if pass_result is not None:
        return HttpResponse(pass_result, status=400)

    existing_account = User.objects.filter(email=email).first()
    print(existing_account)
    if existing_account:
        token = PasswordResetToken(existing_account)
        token.save()

        text_message = (
            f"If it was you and you forgot your password, follow this link to reset it: "
            f"\n{settings.SITE_URL}/account/reset_password/{token.token}"
            "\nIf you'd like to log in, follow this link: "
            f"\n{settings.SITE_URL}/account/login"
            "\nIf you didn't try to register an account, ignore this email."
        )

        html_message = (
            f"If it was you and you forgot your password, follow this link to reset it: "
            f'<a href="{settings.SITE_URL}/account/reset_password/{token.token}">Reset password</a>'
            "<br>If you'd like to log in, follow this link: "
            f'<a href="{settings.SITE_URL}/account/login">Log in</a>'
            "<br>If you didn't try to register an account, ignore this email."
        )

        message = EmailMultiAlternatives(
            "Someone tried to register an account with your email address",
            text_message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
        message.attach_alternative(
            html_message,
            "text/html",
        )
        message.send()

    else:
        user = User(username=username, email=email)
        user.verification_token = get_random_string(64)
        user.set_password(password)
        user.save()

        text_message = (
            f"Welcome to {settings.SITE_NAME}! "
            f"Follow this link to verify your email address: "
            f"\n{settings.SITE_URL}/account/verify_email/{user.verification_token}"
            "\nIf you didn't try to register an account, ignore this email."
        )

        html_message = (
            f"Welcome to {settings.SITE_NAME}! "
            f"Follow this link to verify your email address: "
            f'<a href="{settings.SITE_URL}/account/verify_email/{user.verification_token}">Verify email</a>'
            "<br>If you didn't try to register an account, ignore this email."
        )

        message = EmailMultiAlternatives(
            "Welcome to " + settings.SITE_NAME,
            text_message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
        )
        message.attach_alternative(
            html_message,
            "text/html",
        )
        message.send()

    return HttpResponse("OK")


@require_POST
def verify_email(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    token: str = data["token"]
    user = User.objects.filter(verification_token=token).first()
    if user:
        user.verification_token = None
        user.save()
        login(request, user)
        return HttpResponse("OK")
    return HttpResponse("Invalid token", status=400)


@require_POST
@login_required
def change_password(request: HttpRequest) -> HttpResponse:
    if request.user.oauth_provider:  # type: ignore
        return HttpResponse("Cannot change password for OAuth accounts", status=400)

    data = json.loads(request.body)
    current_password: str = data["current_password"]
    new_password: str = data["new_password"]
    if not request.user.check_password(current_password):
        return HttpResponse("Incorrect current password", status=400)

    pass_result = validate_password(new_password)
    if pass_result is not None:
        return HttpResponse(pass_result, status=400)

    request.user.set_password(new_password)
    request.user.save()

    login(request, request.user)  # type: ignore

    return HttpResponse("OK")


@require_POST
def request_password_reset(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    email: str = data["email"]
    user = User.objects.filter(email=email).first()
    if not user or user.oauth_provider:
        return HttpResponse("OK")

    token = PasswordResetToken(user=user)
    token.save()

    message = EmailMultiAlternatives(
        "Password reset",
        f"Follow this link to reset your password:\n{settings.SITE_URL}/account/reset_password/{token.token}",
        settings.DEFAULT_FROM_EMAIL,
        [email],
    )
    message.attach_alternative(
        f'Follow this link to reset your password: <a href="{settings.SITE_URL}/account/reset_password/{token.token}">Reset password</a>',
        "text/html",
    )
    message.send()

    return HttpResponse("OK")


@require_POST
def reset_password(request: HttpRequest) -> HttpResponse:
    body = json.loads(request.body)
    token = body.get("token")
    if not token:
        return HttpResponse("Missing token", status=400)

    our_token = PasswordResetToken.get(token)
    print(token)
    if not our_token or our_token.token != token:
        return HttpResponse("Invalid token", status=400)

    new_password = body.get("new_password")
    if not new_password:
        return HttpResponse("Missing new password", status=400)

    pass_result = validate_password(new_password)
    if pass_result is not None:
        return HttpResponse(pass_result, status=400)

    our_token.user.set_password(new_password)
    our_token.user.save()
    login(request, our_token.user)
    our_token.delete()

    return HttpResponse("OK")


@require_safe
def check_username(request: HttpRequest, username: str) -> JsonResponse:
    return JsonResponse({"exists": User.objects.filter(username=username).exists()})


@require_safe
def get_user(request: HttpRequest, username: str) -> JsonResponse:
    user = get_object_or_404(User, username=username)
    serialized = UserSerializer(
        user,
        context={"request": request},
    ).data

    return JsonResponse(serialized)
