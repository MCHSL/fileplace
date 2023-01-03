import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../client";
import DirectoryListing from "../components/directory_listing/DirectoryListing";
import LoggedInAs from "../components/misc/LoggedInAs";
import useDirectory from "../context/DirectoryContext";
import useUser from "../context/UserContext";

interface UserInfo {
  id: number;
  username: string;
  root_directory: number;
}

const UserPage = () => {
  let username = useParams().username;

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [userError, setUserError] = useState(null);

  const navigate = useNavigate();
  const { currentDirectory, setCurrentDirectoryId } = useDirectory();

  useEffect(() => {
    if (username) {
      client
        .get(`/user/${username}`)
        .then((res) => {
          setUserInfo(res.data);
          setCurrentDirectoryId(res.data.root_directory);
        })
        .catch((err) => {
          setUserError(err);
        });
    }
  }, [username]);

  if (!userInfo) {
    return null;
  }

  return (
    <div>
      <div className="text-right w-full">
        <LoggedInAs />
      </div>
      <div className="text-center w-full">
        <h1 className="font-bold text-xl">{userInfo.username}</h1>
      </div>
      <div className="flex flex-col gap-1">
        <DirectoryListing />
      </div>
    </div>
  );
};

export default UserPage;
