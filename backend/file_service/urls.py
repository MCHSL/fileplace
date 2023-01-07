from django.urls import include, path, re_path

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
                    path("register", views.register, name="register"),
                    path(
                        "check_username/<str:username>",
                        views.check_username,
                        name="check_username",
                    ),
                    path(
                        "get/<str:username>",
                        views.get_user,
                        name="get_user",
                    ),
                    path(
                        "oauth/<str:provider>",
                        views.oauth_login,
                        name="oauth",
                    ),
                    path(
                        "set_username",
                        views.set_username,
                        name="set_username",
                    ),
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
                    path(
                        "set_private",
                        views.set_directory_private,
                        name="set_directory_private",
                    ),
                    path("find", views.find_directory, name="find_directory"),
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
                    path(
                        "set_private", views.set_file_private, name="set_file_private"
                    ),
                ]
            ),
        )
    ]
    + [
        path(
            "og/",
            include(
                [
                    path("", views.general_opengraph, name="general_opengraph"),
                    path(
                        "download/<int:file_id>",
                        views.download_opengraph,
                        name="download_opengraph",
                    ),
                    re_path(".*", views.general_opengraph, name="general_opengraph"),
                ]
            ),
        )
    ]
    + [
        path("search", views.search, name="search"),
    ]
)
