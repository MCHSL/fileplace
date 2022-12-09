from django.urls import include, path

from . import views

urlpatterns = (
    [
        path(
            "user/",
            include(
                [
                    path("", views.user, name="user"),
                    path("login", views.do_login, name="login"),
                    path("logout", views.do_logout, name="logout"),
                ]
            ),
        )
    ]
    + [
        path(
            "directory/",
            include(
                [
                    path(
                        "<int:directory_id>", views.get_directory, name="get_directory"
                    ),
                    path("create", views.create_directory, name="create_directory"),
                    path("delete", views.delete_directory, name="delete_directory"),
                    path("move", views.move_directory, name="move_directory"),
                    path("rename", views.rename_directory, name="rename_directory"),
                ]
            ),
        ),
    ]
    + [
        path(
            "file/",
            include(
                [
                    path("upload", views.upload, name="upload"),
                    path("download/<int:file_id>", views.download, name="download"),
                    path("delete", views.delete_files, name="delete_files"),
                    path("move", views.move_files, name="move_files"),
                    path("rename", views.rename_file, name="rename_file"),
                ]
            ),
        )
    ]
    + [path("search", views.search_files, name="search_files")]
)
