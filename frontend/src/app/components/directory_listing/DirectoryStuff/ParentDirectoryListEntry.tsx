import React from "react";
import client from "../../../client";
import useDirectory from "../../../context/DirectoryContext";

interface ParentDirectoryListEntryProps {
  id: number;
}

// A lot of this is copy-pasted from DirectoryListEntry.tsx and that's not great
const ParentDirectoryListEntry = ({ id }: ParentDirectoryListEntryProps) => {
  const [dragging, setDragging] = React.useState(false);
  const { setCurrentDirectoryId, directoryRefetch } = useDirectory();

  const moveFiles = (files: number[]) => {
    setDragging(false);
    client.post("/file/move", { files, directory: id }).then(directoryRefetch);
  };

  const moveDirectory = (moved_directory: number) => {
    setDragging(false);
    client
      .post("/directory/move", {
        directory: moved_directory,
        parent: id,
      })
      .then(directoryRefetch);
  };

  return (
    <div
      key={id}
      className="p-1 text-left font-bold hover:bg-slate-100 hover:cursor-pointer w-full data-[dragging=true]:bg-slate-100"
      data-dragging={dragging}
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
      onClick={() => setCurrentDirectoryId(id)}
    >
      Go up
    </div>
  );
};

export default ParentDirectoryListEntry;
