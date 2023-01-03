import React from "react";
import useUser from "../../context/UserContext";

const LoggedInAs = () => {
  const { user, logout } = useUser();
  return (
    <div>
      Logged in as {user?.username} (
      <span
        className="underline text-blue-400 hover:cursor-pointer"
        onClick={logout}
      >
        Logout
      </span>
      )
    </div>
  );
};

export default LoggedInAs;
