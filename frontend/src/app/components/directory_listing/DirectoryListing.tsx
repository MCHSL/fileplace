import React, { useEffect } from "react";
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
    directoryError,
    directoryRefetch,
    filter,
    setFilter,
  } = useDirectory();
  const navigate = useNavigate();
  const { user } = useUser();

  if (directoryError) {
    return (
      <span className="flex text-xl font-bold justify-center mt-10">
        Directory not found.
      </span>
    );
  }

  if (!currentDirectory) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 justify-center">
      <span>
        <span className="relative p-2">
          <input
            type="search"
            placeholder="Search..."
            value={filter || ""}
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-3/4 place-self-center mt-5"
          />
          <span
            data-filter={!!filter}
            className="text-3xl top-[50%] -translate-y-[55%] right-0 px-4 hover:cursor-pointer absolute data-[filter=false]:hidden"
            onClick={() => setFilter("")}
          >
            &times;
          </span>
        </span>
        <button
          onClick={() =>
            navigate(
              `/search/${currentDirectory.user.username}?search=${
                filter || ""
              }`,
              {
                state: { leaving: true, from: currentDirectory.id },
              }
            )
          }
          className="
		  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1
		"
        >
          Full search...
        </button>
      </span>
      <DirectoryPath />
      <DirectoryList
        directories={currentDirectory.children}
        currentDirectory={currentDirectory}
        directoryError={directoryError}
        directoryLoading={directoryLoading}
        directoryRefetch={directoryRefetch}
      />
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
