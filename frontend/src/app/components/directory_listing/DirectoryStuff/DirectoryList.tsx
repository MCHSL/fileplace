import React from "react";
import useDirectory from "../../../context/DirectoryContext";
import useUser from "../../../context/UserContext";
import DirectoryListEntry from "./DirectoryListEntry";
import NewDirectoryListEntry from "./NewDirectoryListEntry";
import ParentDirectoryListEntry from "./ParentDirectoryListEntry";

const DirectoryList = () => {
  const { currentDirectory, directoryLoading } = useDirectory();
  const { user } = useUser();

  if (directoryLoading && !currentDirectory) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between">
          <span className="underline">Directories</span>
        </div>
        <div className="divide-y border border-x-0 flex flex-col justify-contents-center transition-all duration-500">
          <span className="italic text-slate-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!currentDirectory) {
    return null;
  }

  const { parent: parentDirectory, children: directories } = currentDirectory;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row justify-between">
        <span className="underline">Directories</span>
      </div>
      <div className="divide-y border border-x-0 flex flex-col justify-contents-center transition-all duration-500">
        {parentDirectory ? (
          <ParentDirectoryListEntry
            key={parentDirectory.id}
            id={parentDirectory.id}
          />
        ) : null}
        {directories.length ? (
          directories.map((dir) => (
            <DirectoryListEntry key={dir.id} directory={dir} />
          ))
        ) : (
          <span className="italic text-slate-500">No directories</span>
        )}
        {user?.id == currentDirectory.user.id && <NewDirectoryListEntry />}
      </div>
    </div>
  );
};

export default DirectoryList;
