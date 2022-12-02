import React, { useCallback } from "react";
import client from "../../client";
import useDirectory, {
  BasicDirectory,
  UserFile,
} from "../../context/DirectoryContext";
import useUser from "../../context/UserContext";
import DirectoryListEntry from "./DirectoryListEntry";
import DirectoryPath from "./DirectoryPath";
import FileListEntry from "./FileListEntry";
import ParentDirectoryListEntry from "./ParentDirectoryListEntry";
import FileUpload from "./FileUpload/FileUpload";
import NewDirectoryListEntry from "./NewDirectoryListEntry";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

export interface DirectoryListingProps {
  parentDirectory: BasicDirectory | null;
  path: BasicDirectory[];
  directories: BasicDirectory[];
  files: UserFile[];
}

const DirectoryListing = () => {
  const { user, userError, userLoading } = useUser();
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

  console.log(checkedFiles);

  if (userLoading) {
    return <div>Loading user...</div>;
  }

  if (userError) {
    return <div>Error</div>;
  }

  if (!currentDirectory && directoryLoading) {
    return <div>Loading dir...</div>;
  }

  if (!currentDirectory) {
    return <div>Directory not found</div>;
  }

  const {
    parent: parentDirectory,
    path,
    children: directories,
    files,
  } = currentDirectory;

  return (
    <div className="flex flex-col gap-1 justify-center transition-all duration-500">
      <DirectoryPath path={path} />
      <div className="flex flex-col gap-1">
        <div className="flex flex-row justify-between">
          <span className="underline">Directories</span>
        </div>
        <div className="divide-y border border-x-0 flex flex-col justify-contents-center transition-all duration-500">
          {parentDirectory ? (
            <ParentDirectoryListEntry
              key={parentDirectory.id}
              id={parentDirectory.id}
            />
          ) : null}
          {directories.map((dir) => (
            <DirectoryListEntry key={dir.id} directory={dir} />
          ))}
          <NewDirectoryListEntry />
        </div>
      </div>
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
      <FileUpload />
    </div>
  );
};

export default DirectoryListing;
