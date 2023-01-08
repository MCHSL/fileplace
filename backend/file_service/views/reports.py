import json
from django.http import HttpRequest, HttpResponse, JsonResponse
from ..models import File, Report, User, Directory
from rest_framework import serializers
from django.views.decorators.http import require_POST, require_safe
from ..decorators import require_staff


class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = "__all__"


@require_safe
@require_staff
def get_reports(request: HttpRequest) -> JsonResponse:
    report = Report.objects.all()
    serializer = ReportSerializer(report, many=True)
    return JsonResponse(serializer.data, safe=False)


@require_POST
def create_report(request: HttpRequest) -> HttpResponse:
    data = json.loads(request.body)
    reporter = request.user
    reportee = User.objects.get(pk=data["user"])
    directory = Directory.objects.get(pk=data["directory"])
    file = File.objects.get(pk=data["file"])
    report = Report(
        reported_user=reportee,
        user=reporter,
        message=data["reason"],
        related_directory=directory,
        related_file=file,
    )
    report.save()
    return HttpResponse("OK")


@require_POST
@require_staff
def delete_report(request: HttpRequest) -> HttpResponse:
    pk = request.POST["id"]
    report = Report.objects.get(pk=pk)
    report.delete()
    return HttpResponse("OK")
