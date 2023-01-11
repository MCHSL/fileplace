from ..models import Directory, File, User
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.views.decorators.http import require_safe
from .files import FileSerializer
from .serializers import DirectoryBasicSerializer
from django.shortcuts import get_object_or_404


@require_safe
def search(request: HttpRequest) -> HttpResponse:
    username = request.GET.get("username")
    if not username:
        return HttpResponse("Username must be specified", status=400)
    query = request.GET.get("query")
    if not query:
        return HttpResponse("Query must be specified", status=400)

    user = get_object_or_404(User, username=username)
    if user == request.user or request.user.is_staff:  # type: ignore
        files = File.objects.filter(user=user, name__icontains=query)
        directories = Directory.objects.filter(user=user, name__icontains=query)
    else:
        files = File.objects.filter(user=user, name__icontains=query, private=False)
        directories = Directory.objects.filter(
            user=user, name__icontains=query, private=False
        )

    result = {
        "files": FileSerializer(files, many=True, context={"request": request}).data,
        "directories": DirectoryBasicSerializer(
            directories, many=True, context={"request": request}
        ).data,
    }
    return JsonResponse(result, safe=False)
