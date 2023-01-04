import React from "react";
import { useNavigate } from "react-router-dom";
import useDirectory from "../../context/DirectoryContext";
import useUser from "../../context/UserContext";
import DirectoryList from "./DirectoryStuff/DirectoryList";
import DirectoryPath from "./DirectoryStuff/DirectoryPath";
import FileList from "./FileStuff/FileList";
import FileUpload from "./FileUpload/FileUpload";

const DirectoryListing = () => {
  const {
    currentDirectory,
    directoryLoading,
    directoryRefetch,
    filter,
    setFilter,
  } = useDirectory();
  const navigate = useNavigate();
  const { user } = useUser();

  if (!currentDirectory) {
    return null;
  }

  /*if (userError) {
    return (
      <div>
        <span className="text-red-500">
          An error occured while loading user data, please try again later.
        </span>
      </div>
    );
  }*/

  return (
    <div className="flex flex-col gap-4 justify-center">
      <span>
        <input
          type="text"
          placeholder="Search..."
          value={filter || ""}
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-3/4 place-self-center mt-5"
        />
        <button
          onClick={() => navigate("/search")}
          className="
		  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1
		"
        >
          Full search...
        </button>
      </span>
      <DirectoryPath />
      <DirectoryList />
      <FileList
        owned={currentDirectory.user.id == user?.id}
        files={currentDirectory.files}
        directoryLoading={directoryLoading}
        directoryRefetch={directoryRefetch}
      />
      <FileUpload />
    </div>
  );
};

export default DirectoryListing;
