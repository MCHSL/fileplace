from django.http import HttpRequest, HttpResponse


def login_required(func):
    def wrapper(request: HttpRequest, *args, **kwargs):
        if not request.user.is_authenticated:
            return HttpResponse(status=401)
        return func(request, *args, **kwargs)

    return wrapper
