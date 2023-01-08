from django.conf import settings
from django.http import Http404, HttpRequest, HttpResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_safe
from ..models import File


@require_safe
def download_opengraph(request: HttpRequest, file_id) -> HttpResponse:
    file = get_object_or_404(File, pk=file_id)

    if file.private and file.user != request.user:
        raise Http404()

    return HttpResponse(
        f"""
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta property="og:title" content="{file.name}">
                <meta property="og:url" content="{settings.DOMAIN}/download/{file.pk}">
                <meta property="og:site_name" content="{settings.DOMAIN.split("/")[2]}">
                <meta property="og:type" content="website">
                <meta property="og:locale" content="en_US">
            </head>
        </html>
        """,
        content_type="text/html",
    )


@require_safe
def general_opengraph(request: HttpRequest) -> HttpResponse:
    return HttpResponse(
        f"""
        <html lang="en">
            <head>
                <meta charset="utf-8">
                <meta property="og:url" content="{settings.DOMAIN.split("/")[2]}">
                <meta property="og:site_name" content="{settings.DOMAIN.split("/")[2]}">
                <meta property="og:type" content="website">
                <meta property="og:locale" content="en_US">
            </head>
        </html>
        """,
        content_type="text/html",
    )
