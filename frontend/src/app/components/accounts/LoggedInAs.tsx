import React from "react";
import { useNavigate } from "react-router-dom";
import useDirectory from "../../context/DirectoryContext";
import useUser from "../../context/UserContext";

const LoggedInAs = () => {
  const { user, logout } = useUser();
  const { directoryClear } = useDirectory();
  const navigate = useNavigate();

  const doLogout = () => {
    logout()
      .then(directoryClear)
      .then(() => navigate("/login", { state: { leaving: true } }));
  };

  if (!user) {
    return (
      <div>
        <button
          onClick={() =>
            navigate("/login", {
              state: { next: window.location.pathname, leaving: true },
            })
          }
          className="
		  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1
		"
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <span className="pr-3">Logged in as {user?.username}</span>
      {user && (
        <span>
          <button
            onClick={() =>
              navigate(`/user/${user.username}`, {
                state: { leaving: true },
              })
            }
            className="
		  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1
		"
          >
            Home
          </button>
          <button
            onClick={doLogout}
            className="
		  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1
		"
          >
            Logout
          </button>
          <button
            onClick={() => navigate("/reports")}
            className="
		  bg-red-700 hover:bg-red-900 text-white font-bold py-2 px-4 rounded m-1
		"
          >
            Reports
          </button>
        </span>
      )}
    </div>
  );
};

export default LoggedInAs;
