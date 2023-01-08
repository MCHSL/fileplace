import json
from typing import List

from ..decorators import login_required
from ..models import Directory, File
from .serializers import DirectorySerializer

from django.core.cache import cache
from django.http import Http404, HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.http import require_POST, require_safe


@require_POST
def delete_directory(request: HttpRequest) -> HttpResponse:
    directory: Directory = Directory.objects.get(
        pk=int(json.loads(request.body)["directory"])
    )
    if directory.user != request.user and not request.user.is_staff:  # type: ignore
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
    if (
        directory.private
        and directory.user != request.user
        and not request.user.is_staff  # type: ignore
    ):
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
    if directory.user != request.user and not request.user.is_staff:  # type: ignore
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
    if directory.parent:
        cache.delete(f"children:{directory.parent.pk}")
    return HttpResponse("Directory set to private successfully")


@require_POST
def find_directory(request: HttpRequest) -> JsonResponse:
    data = json.loads(request.body)
    path: List[str] = data["path"]
    root_directory: int = data["root_directory"]

    root = Directory.objects.get(pk=root_directory)
    result: Directory = root.follow_path(path)
    if result is None:
        raise Http404()

    if result.private and result.user != request.user and not request.user.is_staff:  # type: ignore
        raise Http404()

    return JsonResponse(DirectorySerializer(result, context={"request": request}).data)
