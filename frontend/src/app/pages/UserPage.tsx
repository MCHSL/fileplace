import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../client";
import DirectoryListing from "../components/directory_listing/DirectoryListing";
import LoggedInAs from "../components/accounts/LoggedInAs";
import useDirectory from "../context/DirectoryContext";
import { memo } from "react";

interface UserInfo {
  id: number;
  username: string;
  root_directory: number;
}

const UserPage = () => {
  const params = useParams();
  const username = useMemo(() => params.username as string, []);

  const [userInfo, setUserInfo] = useState<UserInfo | null>();
  const [userError, setUserError] = useState(null);

  const { setCurrentDirectoryId, directoryCancel } = useDirectory();

  useEffect(() => {
    client
      .get(`/user/${username}`)
      .then((res) => {
        setUserInfo(res.data);
      })
      .catch((err) => {
        setUserError(err);
      });

    return () => {
      console.log("Cancelling directory listing");
      directoryCancel();
    };
  }, [username]);

  useEffect(() => {
    if (userInfo) {
      setCurrentDirectoryId(userInfo.root_directory);
    }
  }, [userInfo]);

  return (
    <div>
      <div className="text-right w-full">
        <LoggedInAs />
      </div>
      <div className="text-left w-full">
        {userInfo ? (
          <h1 className="font-bold text-xl">
            {userInfo.username}
            {userInfo.username.endsWith("s") ? "'" : "'s"} files
          </h1>
        ) : null}
      </div>
      <div className="flex flex-col gap-1">
        <DirectoryListing />
      </div>
    </div>
  );
};

export default UserPage;
