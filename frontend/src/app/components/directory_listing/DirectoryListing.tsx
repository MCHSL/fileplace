import React from "react";
import useDirectory from "../../context/DirectoryContext";
import useUser from "../../context/UserContext";
import DirectoryList from "./DirectoryStuff/DirectoryList";
import DirectoryPath from "./DirectoryStuff/DirectoryPath";
import FileList from "./FileStuff/FileList";
import FileUpload from "./FileUpload/FileUpload";

const DirectoryListing = () => {
  const { userError } = useUser();
  const {
    currentDirectory,
    directoryLoading,
    directoryRefetch,
    filter,
    setFilter,
  } = useDirectory();

  if (!currentDirectory) {
    return null;
  }

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
      <input
        type="text"
        placeholder="Search..."
        value={filter || ""}
        onChange={(e) => setFilter(e.target.value)}
        className="border border-gray-300 rounded-md p-2 w-3/4 place-self-center mt-5"
      />
      <DirectoryPath />
      <DirectoryList />
      <FileList
        files={currentDirectory.files}
        directoryLoading={directoryLoading}
        directoryRefetch={directoryRefetch}
      />
      <FileUpload />
    </div>
  );
};

export default DirectoryListing;
