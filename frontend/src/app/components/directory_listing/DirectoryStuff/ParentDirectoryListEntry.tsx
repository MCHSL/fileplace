import React from "react";
import useDirectory from "../../../context/DirectoryContext";

interface ParentDirectoryListEntryProps {
  id: number;
}

const ParentDirectoryListEntry = ({ id }: ParentDirectoryListEntryProps) => {
  const { setCurrentDirectoryId } = useDirectory();

  return (
    <div
      key={id}
      className="p-1 text-left hover:bg-slate-100 hover:cursor-pointer"
      onClick={() => setCurrentDirectoryId(id)}
    >
      <span className="font-bold">Go up</span>
    </div>
  );
};

export default ParentDirectoryListEntry;
