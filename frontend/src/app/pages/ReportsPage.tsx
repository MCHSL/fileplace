import React from "react";
import { useEffect, useState } from "react";
import client from "../client";
import { Directory } from "../context/DirectoryContext";
import useUser, { User } from "../context/UserContext";
import { UserFile } from "../context/DirectoryContext";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import LoggedInAs from "../components/accounts/LoggedInAs";

interface Report {
  id: number;
  user: User;
  reported_user: User;
  message: string;
  created_at: string;
  related_file: UserFile | null;
  related_directory: Directory | null;
}

const ReportsPage = () => {
  const { user, userLoading } = useUser();
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    client
      .get("/report/")
      .then((res) => {
        setReports(res.data);
        setError(null);
      })
      .catch((err) => {
        if (err.response.status === 401)
          setError("You do not have access to this page.");
        else setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading || userLoading) {
    return (
      <div>
        <h1>Reports</h1>
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1>Reports</h1>
        <p>Error: {error}</p>
      </div>
    );
  }

  const deleteReport = (reportId: number) => {
    client.post(`/report/delete`, { id: reportId }).then((res) => {
      setReports(reports.filter((report) => report.id !== reportId));
    });
  };

  return (
    <div>
      <div className="text-right w-full">
        <LoggedInAs />
      </div>
      <h1>Reports</h1>
      <div className="flex flex-col gap-1 mt-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="flex flex-col gap-1 rounded border w-1/2 mx-auto shadow p-4"
          >
            <div className="flex flex-row gap-1 justify-between p-1">
              <span className="flex flex-row gap-1">
                <span className="">Reported user:</span>
                <span>{report.reported_user.username}</span>
              </span>
              <span className="flex flex-row gap-1">
                <span>Reported by:</span>
                <span>{report.user.username}</span>
              </span>
            </div>
            <div className="flex flex-row gap-1 justify-between p-1">
              <span className="flex flex-row gap-1">
                <span>Directory:</span>
                <span
                  className="cursor-pointer text-blue-500 underline"
                  onClick={() => {
                    if (report.related_directory) {
                      const path = report.related_directory.path
                        .splice(1)
                        .map((dir) => dir.name)
                        .join("/");
                      navigate(
                        `/user/${report.reported_user.username}/${path}`
                      );
                    }
                  }}
                >
                  {report.related_directory?.name}
                </span>
              </span>
              {report.related_file && (
                <span className="flex flex-row gap-1">
                  <span>File:</span>
                  <span className="text-blue-500 underline">
                    <a
                      href={`${location.protocol}//${location.hostname}/api/file/download/${report.related_file.id}`}
                    >
                      {report.related_file.name}
                    </a>
                  </span>
                </span>
              )}
            </div>
            <div className="flex flex-col text-left p-1">
              <span>Message:</span>
              <span className="p-1 mt-1">{report.message}</span>
            </div>
            <div className="flex flex-row p-1 justify-end">
              <span className="flex flex-row place-self-center">
                <FontAwesomeIcon
                  icon={faTrash}
                  onClick={() => deleteReport(report.id)}
                  className="cursor-pointer"
                />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
