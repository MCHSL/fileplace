import {
  faTrash,
  faPenSquare,
  faLock,
  faUnlockAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import client from "../../../client";
import useDirectory, {
  BasicDirectory,
} from "../../../context/DirectoryContext";
import useUser from "../../../context/UserContext";
import InlineInput from "../../misc/InlineInput";

interface DirectoryListEntryProps {
  directory: BasicDirectory;
}

const DirectoryListEntry = ({ directory }: DirectoryListEntryProps) => {
  const { user } = useUser();
  const { setCurrentDirectoryId, directoryRefetch } = useDirectory();
  const [renaming, setRenaming] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>();
  const location = useLocation();

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

  const doSetPrivate = async () => {
    client
      .post("/directory/set_private", {
        directory: directory.id,
        private: !directory.private,
      })
      .then(directoryRefetch);
  };

  const doGoToDirectory = () => {
    //navigate(location.pathname + "/" + directory.name);
    setCurrentDirectoryId(directory.id);
  };

  return (
    <div
      key={directory.id}
      className="flex flex-row justify-between align-middle gap-1 text-left hover:bg-slate-100 group data-[dragging=true]:bg-slate-100"
      data-dragging={dragging}
    >
      <span className="place-self-center text-green-500 basis-5">
        {directory.private || user?.id != directory.user.id ? (
          <></>
        ) : (
          <FontAwesomeIcon icon={faUnlockAlt} fixedWidth />
        )}
      </span>
      <InlineInput
        editing={renaming}
        setEditing={setRenaming}
        initialValue={directory.name}
        onConfirm={renameDirectory}
        placeholder="Input new directory name..."
        inputProps={{ className: "w-full outline-none grow" }}
      >
        <span
          className="flex flex-row gap-1 p-1 place-self-center text-left grow hover:bg-slate-100 hover:cursor-pointer group-data-[dragging=true]:bg-slate-100"
          data-dragging={dragging}
          draggable={user?.id == directory.user.id}
          onClick={doGoToDirectory}
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
        <span
          data-owned={user?.id == directory.user.id}
          className="flex gap-1 align-middle data-[owned=false]:hidden"
        >
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
          <span
            className="place-self-center sm:hidden text-blue-500 group-hover:flex hover:cursor-pointer"
            onClick={doSetPrivate}
          >
            <FontAwesomeIcon
              icon={directory.private ? faUnlockAlt : faLock}
              fixedWidth
            />
          </span>
        </span>
      </InlineInput>
    </div>
  );
};

export default DirectoryListEntry;
