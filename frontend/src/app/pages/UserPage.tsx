import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from "react-router-dom";
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
  const navigationType = useNavigationType();
  const username = params.username as string;
  const location = useLocation();

  const [userInfo, setUserInfo] = useState<UserInfo | null>();
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState(null);

  const { setCurrentDirectoryId } = useDirectory();

  useEffect(() => {
    setUserLoading(true);
    setUserError(null);
    client
      .get(`/user/get/${username}`)
      .then((res) => {
        setUserInfo(res.data);
        setUserLoading(false);
      })
      .catch((err) => {
        setUserError(err);
      });
  }, [username]);

  const findAndSetCurrentDirectory = () => {
    if (!userInfo) return;
    const path = location.pathname.split("/").slice(3);
    if (path[0]) {
      client
        .post("/directory/find", {
          path,
          root_directory: userInfo.root_directory,
        })
        .then((res) => {
          setCurrentDirectoryId(res.data.id);
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      setCurrentDirectoryId(userInfo.root_directory);
    }
  };

  useEffect(() => {
    if (userInfo && !userLoading) {
      findAndSetCurrentDirectory();
    }
  }, [userInfo, userLoading]);

  useEffect(() => {
    if (navigationType === "POP") {
      findAndSetCurrentDirectory();
    }
  }, [navigationType, location.pathname]);

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
      {userError ? (
        <div className="flex flex-col gap-1">
          <span className="flex text-xl font-bold justify-center mt-10">
            User {username} not found.
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          <DirectoryListing />
        </div>
      )}
    </div>
  );
};

export default UserPage;
