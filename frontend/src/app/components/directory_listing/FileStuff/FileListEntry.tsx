import React from "react";
import client from "../../../client";
import useDirectory, { UserFile } from "../../../context/DirectoryContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

interface FileListEntryProps {
  file: UserFile;
  checked: boolean;
  setChecked: (number, boolean) => void;
}

const FileListEntry = ({ file, checked, setChecked }: FileListEntryProps) => {
  const { directoryRefetch } = useDirectory();

  const deleteFile = async () => {
    const ok = window.confirm(
      `Are you sure you want to delete file "${file.name}"?`
    );
    if (!ok) {
      return;
    }
    client.post("/file/delete", { files: [file.id] }).then(directoryRefetch);
  };

  const onChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(file.id, e.target.checked);
  };

  let checkClassName =
    "flex w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 group-hover:flex";
  if (!checked) {
    checkClassName += " hidden";
  }

  return (
    <div
      key={file.id}
      className="flex flex-row justify-between gap-1 p-1 text-left hover:bg-slate-100 group"
    >
      <span className="flex flex-row gap-1 place-self-center">
        <span>
          <a href={`http://192.168.0.236/api/file/download/${file.id}`}>
            {file.name}
          </a>
        </span>
      </span>
      <span className="place-self-center flex gap-1 align-middle content-center">
        <span
          className="hidden text-red-500 group-hover:flex hover:cursor-pointer"
          onClick={deleteFile}
        >
          <FontAwesomeIcon icon={faTrash} fixedWidth />
        </span>
        <input
          type="checkbox"
          checked={checked}
          className={checkClassName}
          onChange={onChecked}
        />
      </span>
    </div>
  );
};

export default FileListEntry;
