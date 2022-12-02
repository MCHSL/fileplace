import React from "react";
import { BasicDirectory, UserFile } from "../../context/DirectoryContext";
import useUser from "../../context/UserContext";
import DirectoryList from "./DirectoryStuff/DirectoryList";
import DirectoryPath from "./DirectoryStuff/DirectoryPath";
import FileList from "./FileStuff/FileList";
import FileUpload from "./FileUpload/FileUpload";

export interface DirectoryListingProps {
  parentDirectory: BasicDirectory | null;
  path: BasicDirectory[];
  directories: BasicDirectory[];
  files: UserFile[];
}

const DirectoryListing = () => {
  const { userError } = useUser();

  if (userError) {
    return (
      <div>
        <span className="text-red-500">
          An error occured while loading user data, please try again later.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 justify-center">
      <DirectoryPath />
      <DirectoryList />
      <FileList />
      <FileUpload />
    </div>
  );
};

export default DirectoryListing;
