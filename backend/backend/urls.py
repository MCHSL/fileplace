"""backend URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

from rest_framework import routers

from django.conf import settings
from django.conf.urls.static import static

from file_service.views import (
    UserViewSet,
    FileViewSet,
    DirectoryViewSet,
    upload,
    download,
    delete_file,
    user,
    do_login,
    get_directory,
    create_directory,
)


# Routers provide an easy way of automatically determining the URL conf.
router = routers.DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"files", FileViewSet)
router.register(r"directory", DirectoryViewSet)


urlpatterns = [
    path("", include(router.urls)),
    path("get_directory/<int:directory_id>", get_directory),
    path("create_directory", create_directory),
    path("login", do_login),
    path("user", user),
    path("upload", upload),
    path("download/<int:file_id>", download),
    path("delete_file", delete_file),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
