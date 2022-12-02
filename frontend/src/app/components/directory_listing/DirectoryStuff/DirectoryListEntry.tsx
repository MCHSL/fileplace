import React from "react";
import useDirectory, {
  BasicDirectory,
} from "../../../context/DirectoryContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import client from "../../../client";

interface DirectoryListEntryProps {
  directory: BasicDirectory;
}

const DirectoryListEntry = ({ directory }: DirectoryListEntryProps) => {
  const { setCurrentDirectoryId, directoryRefetch } = useDirectory();

  const deleteDirectory = () => {
    const ok = window.confirm(
      `Are you sure you want to delete directory "${directory.name}"?`
    );
    if (!ok) {
      return;
    }
    client
      .post("/directory/delete", { directory: directory.id })
      .then(directoryRefetch);
  };

  return (
    <div className="flex flex-row justify-between gap-1 p-1 hover:bg-slate-100 group">
      <span
        key={directory.id}
        className="text-left hover:bg-slate-100 hover:cursor-pointer w-full"
        onClick={() => setCurrentDirectoryId(directory.id)}
      >
        <span>{directory.name}</span>
      </span>
      <span
        className="place-self-center hidden group-hover:block text-red-500 hover:cursor-pointer"
        onClick={deleteDirectory}
      >
        <FontAwesomeIcon icon={faTrash} fixedWidth />
      </span>
    </div>
  );
};

export default DirectoryListEntry;
