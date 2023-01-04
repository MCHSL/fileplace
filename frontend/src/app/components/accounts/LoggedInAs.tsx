import React from "react";
import { useNavigate } from "react-router-dom";
import useDirectory from "../../context/DirectoryContext";
import useUser from "../../context/UserContext";

const LoggedInAs = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  const doLogout = () => {
    logout().then(() => navigate("/login"));
  };

  if (!user) {
    return (
      <div>
        <button
          onClick={() =>
            navigate("/login", { state: { next: window.location.pathname } })
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
      Logged in as {user?.username} (
      <span
        className="underline text-blue-400 hover:cursor-pointer"
        onClick={doLogout}
      >
        Logout
      </span>
      )
    </div>
  );
};

export default LoggedInAs;
