from django.urls import include, path, re_path

from .views import reports, users, files, directories, opengraph, search

urlpatterns = (
    [
        path(
            "user/",
            include(
                [
                    path("", users.user, name="user"),
                    path("login", users.do_login, name="login"),
                    path("logout", users.do_logout, name="logout"),
                    path("register", users.register, name="register"),
                    path(
                        "check_username/<str:username>",
                        users.check_username,
                        name="check_username",
                    ),
                    path(
                        "get/<str:username>",
                        users.get_user,
                        name="get_user",
                    ),
                    path(
                        "oauth/<str:provider>",
                        users.oauth_login,
                        name="oauth",
                    ),
                    path(
                        "set_username",
                        users.set_username,
                        name="set_username",
                    ),
                    path(
                        "change_password",
                        users.change_password,
                        name="change_password",
                    ),
                    path(
                        "request_password_reset",
                        users.request_password_reset,
                        name="request_password_reset",
                    ),
                    path(
                        "reset_password",
                        users.reset_password,
                        name="reset_password",
                    ),
                    path(
                        "verify_email",
                        users.verify_email,
                        name="verify_email",
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
                        "<int:directory_id>",
                        directories.get_directory,
                        name="get_directory",
                    ),
                    path(
                        "create", directories.create_directory, name="create_directory"
                    ),
                    path(
                        "delete", directories.delete_directory, name="delete_directory"
                    ),
                    path("move", directories.move_directory, name="move_directory"),
                    path(
                        "rename", directories.rename_directory, name="rename_directory"
                    ),
                    path(
                        "set_private",
                        directories.set_directory_private,
                        name="set_directory_private",
                    ),
                    path("find", directories.find_directory, name="find_directory"),
                ]
            ),
        ),
    ]
    + [
        path(
            "file/",
            include(
                [
                    path("upload", files.upload, name="upload"),
                    path("download/<int:file_id>", files.download, name="download"),
                    path("delete", files.delete_files, name="delete_files"),
                    path("move", files.move_files, name="move_files"),
                    path("rename", files.rename_file, name="rename_file"),
                    path(
                        "set_private", files.set_file_private, name="set_file_private"
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
                    path("", opengraph.general_opengraph, name="general_opengraph"),
                    path(
                        "download/<int:file_id>",
                        opengraph.download_opengraph,
                        name="download_opengraph",
                    ),
                    re_path(
                        ".*", opengraph.general_opengraph, name="general_opengraph"
                    ),
                ]
            ),
        )
    ]
    + [
        path(
            "report/",
            include(
                [
                    path("", reports.get_reports, name="get_reports"),
                    path("create", reports.create_report, name="create_report"),
                    path("delete", reports.delete_report, name="delete_report"),
                ]
            ),
        ),
    ]
    + [
        path("search", search.search, name="search"),
    ]
)
