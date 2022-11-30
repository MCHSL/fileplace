import React from "react";
import { UserFile } from "../../context/DirectoryContext";

interface FileListEntryProps {
  file: UserFile;
}

const FileListEntry = ({ file }: FileListEntryProps) => {
  return (
    <div
      key={file.id}
      className="p-1 text-left hover:bg-slate-100 hover:cursor-pointer"
    >
      <span>{file.name}</span>
    </div>
  );
};

export default FileListEntry;
