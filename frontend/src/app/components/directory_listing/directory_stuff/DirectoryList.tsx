import React from "react";
import useDirectory, {
  BasicDirectory,
  Directory,
} from "../../../context/DirectoryContext";
import useUser from "../../../context/UserContext";
import DirectoryListEntry from "./DirectoryListEntry";
import NewDirectoryListEntry from "./NewDirectoryListEntry";
import ParentDirectoryListEntry from "./ParentDirectoryListEntry";

interface DirectoryListProps {
  currentDirectory: Directory | null;
  directoryLoading: boolean;
  directoryError: any;
  directories: BasicDirectory[] | null;
  directoryRefetch: () => void;
}

const DirectoryList = ({
  currentDirectory,
  directories,
  directoryLoading,
  directoryError,
}: DirectoryListProps) => {
  const { user } = useUser();

  if (directoryLoading && directories) {
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

  if (directoryError) {
    return <span className="flex text-lg">Directory not found.</span>;
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row justify-between">
        <span className="underline">Directories</span>
      </div>
      <div className="divide-y border border-x-0 flex flex-col justify-contents-center transition-all duration-500">
        {currentDirectory?.parent && (
          <ParentDirectoryListEntry
            key={currentDirectory.parent.id}
            id={currentDirectory.parent.id}
          />
        )}
        {directories?.length ? (
          directories.map((dir) => (
            <DirectoryListEntry key={dir.id} directory={dir} />
          ))
        ) : (
          <span className="italic text-slate-500">No directories</span>
        )}
        {user && user.id == currentDirectory?.user.id && (
          <NewDirectoryListEntry />
        )}
      </div>
    </div>
  );
};

export default DirectoryList;
