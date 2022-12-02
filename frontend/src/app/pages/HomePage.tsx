import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DirectoryListing from "../components/directory_listing/DirectoryListing";
import useDirectory from "../context/DirectoryContext";
import useUser from "../context/UserContext";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, userError } = useUser();
  const { currentDirectory, setCurrentDirectoryId } = useDirectory();

  useEffect(() => {
    if (user && !currentDirectory) {
      setCurrentDirectoryId(user.root_directory);
    }
    if (userError) {
      navigate("/login");
      return;
    }
  }, [user, userError]);

  return (
    <div>
      <div className="text-right w-full">Logged in as {user?.username}</div>
      <div className="flex flex-col gap-1">
        <DirectoryListing />
      </div>
    </div>
  );
};

export default HomePage;
