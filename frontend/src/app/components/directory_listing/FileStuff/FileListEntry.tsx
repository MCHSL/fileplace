import {
  faTrash,
  faPenSquare,
  faLock,
  faUnlockAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import client from "../../../client";
import useDirectory, { UserFile } from "../../../context/DirectoryContext";
import useUser from "../../../context/UserContext";
import UserPage from "../../../pages/UserPage";
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
  const { user } = useUser();
  const [renaming, setRenaming] = React.useState(false);
  const { renameFile } = useDirectory();

  const deleteFile = async () => {
    const ok = window.confirm(
      `Are you sure you want to delete file "${file.name}"?`
    );
    if (!ok) {
      return;
    }
    client.post("/file/delete", { files: [file.id] }).then(refetch);
  };

  const rename = async (newName) => {
    if (!newName) {
      return;
    }
    renameFile(file.id, newName);
  };

  const onChecked = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(file.id, e.target.checked);
  };

  const doSetPrivate = async () => {
    client
      .post("/file/set_private", { file: file.id, private: !file.private })
      .then(refetch);
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
      <span className="place-self-center text-green-500 basis-5">
        {file.private || user?.id != file.user.id ? (
          <></>
        ) : (
          <FontAwesomeIcon icon={faUnlockAlt} fixedWidth />
        )}
      </span>
      <InlineInput
        initialValue={file.name}
        onConfirm={rename}
        editing={renaming}
        setEditing={setRenaming}
        placeholder="Enter new name"
        selection={[0, nameLength]}
        inputProps={{ className: "w-full outline-none grow" }}
      >
        <span className="flex flex-row gap-1 place-self-center text-left grow">
          <a
            draggable
            href={`http://192.168.0.236/api/file/download/${file.id}`}
            onDragStart={(e) => {
              e.dataTransfer.setData("files", JSON.stringify([file.id]));
            }}
          >
            {file.name}
          </a>
        </span>
        <span
          data-owned={user?.id == file.user.id}
          className="flex gap-1 align-middle data-[owned=false]:hidden"
        >
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
          <span
            className="place-self-center sm:hidden text-blue-500 group-hover:flex hover:cursor-pointer"
            onClick={doSetPrivate}
          >
            <FontAwesomeIcon
              icon={file.private ? faUnlockAlt : faLock}
              fixedWidth
            />
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
