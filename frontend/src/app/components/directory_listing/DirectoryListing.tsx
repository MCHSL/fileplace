import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../client";
import useDirectory, {
  BasicDirectory,
  UserFile,
} from "../../context/DirectoryContext";
import useUser from "../../context/UserContext";
import DirectoryListEntry from "./DirectoryListEntry";
import DirectoryPath from "./DirectoryPath";
import FileListEntry from "./FileListEntry";
import ParentDirectoryListEntry from "./ParentDirectoryListEntry";

export interface DirectoryListingProps {
  parentDirectory: BasicDirectory | null;
  path: BasicDirectory[];
  directories: BasicDirectory[];
  files: UserFile[];
}

const DirectoryListing = () => {
  const { user, userError, userLoading } = useUser();
  const { currentDirectory, directoryLoading, directoryRefetch } =
    useDirectory();

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
    client.post("/file/upload", data).then(directoryRefetch);
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

  const {
    parent: parentDirectory,
    path,
    children: directories,
    files,
  } = currentDirectory;

  return (
    <div className="divide-y border border-x-0 flex flex-col">
      <DirectoryPath path={path} />
      {parentDirectory ? (
        <ParentDirectoryListEntry
          key={parentDirectory.id}
          id={parentDirectory.id}
        />
      ) : null}
      {directories.map((dir) => (
        <DirectoryListEntry key={dir.id} directory={dir} />
      ))}
      {files.map((file) => (
        <FileListEntry key={file.id} file={file} />
      ))}
    </div>
  );
};

export default DirectoryListing;
