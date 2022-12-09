import { faTrash, faPenSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import client from "../../../client";
import { UserFile } from "../../../context/DirectoryContext";
import InlineInput from "../../misc/InlineInput";

interface FileListEntryProps {
  file: UserFile;
  checked: boolean;
  setChecked: (number, boolean) => void;
  refetch: () => void;
}

const FileListEntry = ({
  file,
  checked,
  setChecked,
  refetch,
}: FileListEntryProps) => {
  const [renaming, setRenaming] = React.useState(false);

  const deleteFile = async () => {
    const ok = window.confirm(
      `Are you sure you want to delete file "${file.name}"?`
    );
    if (!ok) {
      return;
    }
    client.post("/file/delete", { files: [file.id] }).then(refetch);
  };

  const renameFile = async (newName) => {
    if (!newName) {
      return;
    }
    let originalName = file.name;
    file.name = newName;
    client
      .post("/file/rename", { file: file.id, name: newName })
      .then(refetch)
      .catch(() => {
        file.name = originalName;
      });
  };

  const onChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(file.id, e.target.checked);
  };

  let checkClassName =
    "flex w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 group-hover:flex place-self-center";
  if (!checked) {
    checkClassName += " sm:hidden";
  }

  // gets length of file name without extension
  const nameLength = file.name.lastIndexOf(".");

  return (
    <div
      key={file.id}
      className="flex flex-row justify-between align-middle gap-1 p-1 text-left hover:bg-slate-100 group"
    >
      <InlineInput
        initialValue={file.name}
        onConfirm={renameFile}
        editing={renaming}
        setEditing={setRenaming}
        placeholder="Enter new name"
        selection={[0, nameLength]}
        inputProps={{ className: "w-full outline-none" }}
      >
        <span className="flex flex-row gap-1 place-self-center">
          <span>
            <a href={`http://192.168.0.236/api/file/download/${file.id}`}>
              {file.name}
            </a>
          </span>
        </span>
        <span className="flex gap-1 align-middle">
          <span
            className="place-self-center sm:hidden text-blue-500 group-hover:flex hover:cursor-pointer"
            onClick={() => setRenaming(true)}
          >
            <FontAwesomeIcon icon={faPenSquare} fixedWidth />
          </span>
          <span
            className="place-self-center sm:hidden text-red-500 group-hover:flex hover:cursor-pointer"
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
      </InlineInput>
    </div>
  );
};

export default FileListEntry;
