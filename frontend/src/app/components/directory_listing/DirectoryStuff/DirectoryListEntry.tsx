import { faTrash, faPenSquare } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import client from "../../../client";
import useDirectory, {
  BasicDirectory,
} from "../../../context/DirectoryContext";
import InlineInput from "../../misc/InlineInput";

interface DirectoryListEntryProps {
  directory: BasicDirectory;
}

const DirectoryListEntry = ({ directory }: DirectoryListEntryProps) => {
  const { setCurrentDirectoryId, directoryRefetch } = useDirectory();
  const [renaming, setRenaming] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);

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

  const renameDirectory = (newName: string) => {
    const oldName = directory.name;
    directory.name = newName;
    client
      .post("/directory/rename", { directory: directory.id, name: newName })
      .then(directoryRefetch)
      .catch(() => {
        directory.name = oldName;
      });
  };

  const moveFiles = (files: number[]) => {
    setDragging(false);
    client
      .post("/file/move", { files, directory: directory.id })
      .then(directoryRefetch);
  };

  const moveDirectory = (moved_directory: number) => {
    setDragging(false);
    client
      .post("/directory/move", {
        directory: moved_directory,
        parent: directory.id,
      })
      .then(directoryRefetch);
  };

  return (
    <div
      className="flex flex-row justify-between gap-1 p-1 hover:bg-slate-100 group data-[dragging=true]:bg-slate-100"
      data-dragging={dragging}
    >
      <InlineInput
        editing={renaming}
        setEditing={setRenaming}
        initialValue={directory.name}
        onConfirm={renameDirectory}
        placeholder="Input new directory name..."
        inputProps={{ className: "w-full outline-none" }}
      >
        <span
          key={directory.id}
          className="text-left hover:bg-slate-100 hover:cursor-pointer w-full group-data-[dragging=true]:bg-slate-100"
          data-dragging={dragging}
          draggable
          onClick={() => setCurrentDirectoryId(directory.id)}
          onDragStart={(e) => {
            e.dataTransfer.setData(
              "moved_directory",
              JSON.stringify(directory.id)
            );
          }}
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDropCapture={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.getData("files");
            if (files) {
              moveFiles(JSON.parse(files));
            }
            const moved_directory = e.dataTransfer.getData("moved_directory");
            if (moved_directory) {
              moveDirectory(JSON.parse(moved_directory));
            }
          }}
        >
          {directory.name}
        </span>
        <span className="flex flex-row">
          <span
            className="place-self-center hidden group-hover:block text-blue-500 hover:cursor-pointer"
            onClick={() => setRenaming(true)}
          >
            <FontAwesomeIcon icon={faPenSquare} fixedWidth />
          </span>
          <span
            className="place-self-center hidden group-hover:block text-red-500 hover:cursor-pointer"
            onClick={deleteDirectory}
          >
            <FontAwesomeIcon icon={faTrash} fixedWidth />
          </span>
        </span>
      </InlineInput>
    </div>
  );
};

export default DirectoryListEntry;
