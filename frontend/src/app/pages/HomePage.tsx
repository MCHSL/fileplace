import React, { useEffect } from "react";
import client from "../client";
import DirectoryListing from "../components/directory_listing/DirectoryListing";
import useUser from "../context/UserContext";
import useDirectory from "../context/DirectoryContext";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, userError, userLoading } = useUser();
  const {
    currentDirectory,
    directoryLoading,
    setCurrentDirectoryId,
    directoryRefetch,
  } = useDirectory();

  useEffect(() => {
    if (userError) {
      navigate("/login");
      return;
    }
    if (user) {
      setCurrentDirectoryId(user.root_directory);
    }
  }, [user, userError]);

  if (userLoading) {
    return <div>Loading user...</div>;
  }

  if (userError) {
    return <div>Error</div>;
  }

  if (!currentDirectory && directoryLoading) {
    return <div>Loading dir...</div>;
  }

  if (!currentDirectory) {
    return <div>Directory not found</div>;
  }

  const upload_file = (e: any) => {
    if (!user || !currentDirectory) {
      return;
    }
    e.preventDefault();
    const data = new FormData();
    data.append("file", e.target.files[0]);
    data.append("directory", currentDirectory.id.toString());
    client.post("/upload", data).then((res) => {
      directoryRefetch();
    });
  };

  const createDirectory = () => {
    if (!user || !currentDirectory) {
      return;
    }
    const name = prompt("Enter directory name");
    if (!name) {
      return;
    }
    client
      .post("/create_directory", {
        name,
        parent: currentDirectory.id,
      })
      .then(directoryRefetch);
  };

  return (
    <div className="flex flex-col gap-1">
      <button onClick={createDirectory}>Create Directory</button>
      <DirectoryListing
        path={currentDirectory.path}
        parentDirectory={currentDirectory.parent}
        directories={currentDirectory.children}
        files={currentDirectory.files}
      />
      <input type="file" onChange={upload_file} />
    </div>
  );
};

export default HomePage;
