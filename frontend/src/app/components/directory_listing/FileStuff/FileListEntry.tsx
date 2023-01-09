import {
  faTrash,
  faPenSquare,
  faLock,
  faUnlockAlt,
  faShareSquare,
  faWarning,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useReducer } from "react";
import client from "../../../client";
import useDirectory, { UserFile } from "../../../context/DirectoryContext";
import useUser from "../../../context/UserContext";
import InlineInput from "../../misc/InlineInput";
import ReportModal from "../../misc/ReportModal";

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
  const [showCopy, setShowCopy] = React.useState(false);
  const [reporting, setReporting] = React.useState(false);

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

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/download/${file.id}`
    );
    setShowCopy(true);
    setTimeout(() => {
      setShowCopy(false);
    }, 2000);
  };

  const reportFile = () => {
    setReporting(true);
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
      <ReportModal
        user={file.user}
        file={file}
        directory={file.directory}
        show={reporting}
        close={() => setReporting(false)}
      />
      {user?.id == file.user.id && (
        <span className="place-self-center text-green-500 basis-5">
          {!file.private && <FontAwesomeIcon icon={faUnlockAlt} fixedWidth />}
        </span>
      )}
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
            draggable={user?.id == file.user.id}
            href={`${location.protocol}//${location.hostname}/api/file/download/${file.id}`}
            onDragStart={(e) => {
              e.dataTransfer.setData("files", JSON.stringify([file.id]));
            }}
          >
            {file.name}
          </a>
        </span>
        <span className="flex gap-1 align-middle">
          {showCopy && (
            <span className="place-self-center text-green-500 font-bold">
              Copied!
            </span>
          )}
          {user?.id == file.user.id && (
            <>
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
            </>
          )}
          {!file.private && (
            <span
              className="place-self-center sm:hidden text-blue-500 group-hover:flex hover:cursor-pointer"
              onClick={copyLink}
            >
              <FontAwesomeIcon icon={faShareSquare} fixedWidth />
            </span>
          )}
          {user?.id == file.user.id && (
            <span
              className="place-self-center sm:hidden text-blue-500 group-hover:flex hover:cursor-pointer"
              onClick={doSetPrivate}
            >
              <FontAwesomeIcon
                icon={file.private ? faUnlockAlt : faLock}
                fixedWidth
              />
            </span>
          )}
          {user && (
            <span
              className="place-self-center sm:hidden text-red-500 group-hover:flex hover:cursor-pointer"
              onClick={reportFile}
            >
              <FontAwesomeIcon icon={faWarning} fixedWidth />
            </span>
          )}
          {user?.id == file.user.id && (
            <input
              type="checkbox"
              checked={checked}
              className={checkClassName}
              onChange={onChecked}
            />
          )}
        </span>
      </InlineInput>
    </div>
  );
};

export default FileListEntry;
