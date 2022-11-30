import React from "react";
import useDirectory, { BasicDirectory } from "../../context/DirectoryContext";

interface DirectoryListEntryProps {
  directory: BasicDirectory;
}

const DirectoryListEntry = ({ directory }: DirectoryListEntryProps) => {
  const { setCurrentDirectoryId } = useDirectory();

  return (
    <div
      key={directory.id}
      className="p-1 text-left hover:bg-slate-100 hover:cursor-pointer"
      onClick={() => setCurrentDirectoryId(directory.id)}
    >
      <span className="font-bold">{directory.name}</span>
    </div>
  );
};

export default DirectoryListEntry;
