import React from "react";
import { useNavigate } from "react-router-dom";
import LoggedInAs from "../components/accounts/LoggedInAs";
import useUser from "../context/UserContext";

const AccountPage = () => {
  const { user, userLoading } = useUser();
  const navigate = useNavigate();

  if (userLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="flex flex-col w-1/4 mx-auto gap-4">
        <span>You are not logged in.</span>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mx-auto"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-right w-full">
        <LoggedInAs />
      </div>
      <div className="flex flex-col w-1/3 mx-auto shadow rounded mt-8">
        <span className="flex mx-auto text-2xl">Account information</span>
        <div className="flex flex-col gap-1 p-4">
          <span className="flex flex-row gap-1">
            <span className="font-bold">Username:</span>
            <span>{user.username}</span>
          </span>
          <span className="flex flex-row gap-1">
            <span className="font-bold">Email:</span>
            <span>{user.email}</span>
          </span>
          <span className="flex flex-row gap-1 justify-center mt-4">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={() => {
                navigate("/account/change_password");
              }}
            >
              Change password
            </button>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
