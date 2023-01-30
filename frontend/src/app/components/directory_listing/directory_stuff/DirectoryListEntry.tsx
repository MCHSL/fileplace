import {
  faTrash,
  faPenSquare,
  faLock,
  faUnlockAlt,
  faWarning,
  faGlobe,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Tooltip from "@mui/material/Tooltip";
import React from "react";
import client from "../../../client";
import useDirectory, {
  BasicDirectory,
} from "../../../context/DirectoryContext";
import useUser from "../../../context/UserContext";
import InlineInput from "../../misc/InlineInput";
import ReportModal from "../../misc/ReportModal";

interface DirectoryListEntryProps {
  directory: BasicDirectory;
}

const DirectoryListEntry = ({ directory }: DirectoryListEntryProps) => {
  const { user } = useUser();
  const { setCurrentDirectoryId, directoryRefetch } = useDirectory();
  const [renaming, setRenaming] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const [reporting, setReporting] = React.useState(false);

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
    setCurrentDirectoryId(directory.id);
  };

  const reportDirectory = () => {
    setReporting(true);
  };

  return (
    <div
      key={directory.id}
      className="flex flex-row justify-between align-middle gap-1 px-1 text-left hover:bg-slate-100 group data-[dragging=true]:bg-slate-100"
      data-dragging={dragging}
    >
      <ReportModal
        user={directory.user}
        file={null}
        directory={directory}
        show={reporting}
        close={() => setReporting(false)}
      />
      {user?.id == directory.user.id && (
        <span className="place-self-center text-blue-500 basis-5">
          {!directory.private && (
            <Tooltip
              title="This directory is public. Anyone can browse it."
              arrow
              classes={{ tooltip: "!text-sm  !bg-gray-700" }}
            >
              <FontAwesomeIcon icon={faGlobe} fixedWidth />
            </Tooltip>
          )}
        </span>
      )}
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
            <Tooltip
              title="Rename"
              classes={{ tooltip: "!text-sm  !bg-gray-700" }}
            >
              <FontAwesomeIcon icon={faPenSquare} fixedWidth />
            </Tooltip>
          </span>
          <span
            className="place-self-center hidden group-hover:block text-red-500 hover:cursor-pointer"
            onClick={deleteDirectory}
          >
            <Tooltip
              title="Delete"
              classes={{ tooltip: "!text-sm  !bg-gray-700" }}
            >
              <FontAwesomeIcon icon={faTrash} fixedWidth />
            </Tooltip>
          </span>
          <span
            className="place-self-center sm:hidden text-blue-500 group-hover:flex hover:cursor-pointer"
            onClick={doSetPrivate}
          >
            <Tooltip
              title={directory.private ? "Make public" : "Make private"}
              classes={{ tooltip: "!text-sm  !bg-gray-700" }}
            >
              <FontAwesomeIcon
                icon={directory.private ? faGlobe : faLock}
                fixedWidth
              />
            </Tooltip>
          </span>
        </span>
        {user && (
          <span
            className="place-self-center sm:hidden text-red-500 group-hover:flex hover:cursor-pointer"
            onClick={reportDirectory}
          >
            <Tooltip
              title="Report"
              classes={{ tooltip: "!text-sm  !bg-gray-700" }}
            >
              <FontAwesomeIcon icon={faWarning} fixedWidth />
            </Tooltip>
          </span>
        )}
      </InlineInput>
    </div>
  );
};

export default DirectoryListEntry;
