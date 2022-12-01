import React, { useEffect } from "react";
import DirectoryListing from "../components/directory_listing/DirectoryListing";
import useUser from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import useDirectory from "../context/DirectoryContext";

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
    <div className="flex flex-col gap-1">
      <DirectoryListing />
    </div>
  );
};

export default HomePage;
