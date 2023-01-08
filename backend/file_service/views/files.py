import json
from django.http import Http404, HttpRequest, HttpResponse

from ..decorators import login_required
from ..models import Directory, File
from .serializers import FileSerializer
from django.core.files.uploadedfile import UploadedFile
from django.views.decorators.http import require_POST, require_safe
from django.core.cache import cache
from django.shortcuts import get_object_or_404
from django.conf import settings


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
    file = get_object_or_404(File, pk=file_id)

    if file.private and file.user != request.user and not request.user.is_staff:  # type: ignore
        raise Http404()

    if settings.DEBUG:
        response = HttpResponse(file.file_ref)
        response["Content-Disposition"] = "attachment; filename=%s" % file.name
        return response

    response = HttpResponse()
    response["X-Accel-Redirect"] = f"/protected/{file.file_ref.name}"
    response["Content-Disposition"] = "attachment; filename=%s" % file.name
    response["Content-Length"] = file.size
    return response


@login_required
@require_POST
def delete_files(request: HttpRequest) -> HttpResponse:
    errors = []
    file_ids = json.loads(request.body)["files"]

    directory_ids = set()

    for file in File.objects.filter(pk__in=map(int, file_ids)):
        if file.user != request.user and not request.user.is_staff:  # type: ignore
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
    if file.user != request.user and not request.user.is_staff:  # type: ignore
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
