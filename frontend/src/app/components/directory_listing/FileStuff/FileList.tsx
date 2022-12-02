import React, { useCallback } from "react";
import client from "../../../client";
import useDirectory from "../../../context/DirectoryContext";
import FileListEntry from "./FileListEntry";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

const FileList = () => {
  const { currentDirectory, directoryLoading, directoryRefetch } =
    useDirectory();

  const [checkedFiles, setCheckedFiles] = React.useState<Set<number>>(
    new Set()
  );
  const [checkAll, setCheckAll] = React.useState(false);

  const setChecked = useCallback(
    (id: number, checked: boolean) => {
      if (checked) {
        setCheckedFiles((prev) => new Set(prev).add(id));
      } else {
        setCheckedFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });
      }
    },
    [setCheckedFiles]
  );

  const handleCheckAll = () => {
    if (checkAll) {
      setCheckedFiles(new Set());
    } else {
      setCheckedFiles(
        new Set(currentDirectory?.files.map((file) => file.id) || [])
      );
    }
    setCheckAll(!checkAll);
  };

  const deleteCheckedFiles = async () => {
    const ok = window.confirm(
      `Are you sure you want to delete ${checkedFiles.size} files?`
    );
    if (!ok) {
      return;
    }
    await client
      .post("/file/delete", {
        files: Array.from(checkedFiles),
      })
      .then(directoryRefetch)
      .then(() => {
        setCheckedFiles(new Set());
        setCheckAll(false);
      });
  };

  if (directoryLoading && !currentDirectory) {
    return (
      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between">
          <span className="underline">Files</span>
        </div>

        <div className="divide-y border border-x-0 flex flex-col justify-contents-center transition-all duration-500">
          <div className="text-center italic">Loading...</div>
        </div>
      </div>
    );
  }

  if (!currentDirectory) {
    return null;
  }

  const {
    parent: parentDirectory,
    path,
    children: directories,
    files,
  } = currentDirectory;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-row justify-between">
        <span className="underline">Files</span>
        <span className="flex flex-row gap-4 mr-1">
          <span
            className="place-self-center hidden group-hover:block text-red-500 hover:cursor-pointer"
            style={{ display: checkedFiles.size ? "flex" : "none" }}
            onClick={deleteCheckedFiles}
          >
            <FontAwesomeIcon icon={faTrash} fixedWidth />
          </span>
          <input
            type="checkbox"
            checked={checkAll}
            className="self-center w-4 h-4 text-blue-600 bg-gray-100 rounded border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            onChange={handleCheckAll}
            style={{ display: files.length ? "flex" : "none" }}
          />
        </span>
      </div>

      <div className="divide-y border border-x-0 flex flex-col justify-contents-center transition-all duration-500">
        {files.length ? (
          files.map((file) => (
            <FileListEntry
              key={file.id}
              file={file}
              checked={checkedFiles.has(file.id)}
              setChecked={setChecked}
            />
          ))
        ) : (
          <div className="text-center italic">No files</div>
        )}
      </div>
    </div>
  );
};

export default FileList;
