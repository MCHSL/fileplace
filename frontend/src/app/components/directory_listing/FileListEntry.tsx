import React from "react";
import client from "../../client";
import useDirectory, { UserFile } from "../../context/DirectoryContext";

interface FileListEntryProps {
  file: UserFile;
}

const FileListEntry = ({ file }: FileListEntryProps) => {
  const { directoryRefetch } = useDirectory();

  const deleteFile = async () => {
    client.post("/delete_file", { file: file.id }).then(directoryRefetch);
  };

  return (
    <div key={file.id} className="flex gap-1 p-1 text-left hover:bg-slate-100">
      <span
        onClick={deleteFile}
        className="hover:cursor-pointer hover:text-red-500"
      >
        X
      </span>
      <span>
        <a href={`http://localhost:80/download/${file.id}`}>{file.name}</a>
      </span>
    </div>
  );
};

export default FileListEntry;
