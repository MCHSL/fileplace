import React, { useEffect } from "react";
import client from "../../../client";
import useDirectory from "../../../context/DirectoryContext";
import InlineInput from "../../misc/InlineInput";

const NewDirectoryListEntry = () => {
  const { currentDirectory, directoryRefetch } = useDirectory();
  const [adding, setAdding] = React.useState(false);

  const createDirectory = (name: string) => {
    if (!currentDirectory || !name) {
      return;
    }
    client
      .post("/directory/create", {
        name,
        parent: currentDirectory.id,
      })
      .then(directoryRefetch)
      .then(() => {
        setAdding(false);
      });
  };

  return (
    <div
      className="p-1 text-left hover:bg-slate-100 hover:cursor-pointer"
      onClick={() => {
        setAdding(true);
      }}
    >
      <InlineInput
        onConfirm={createDirectory}
        onCancel={() => setAdding(false)}
        editing={adding}
        setEditing={setAdding}
        initialValue=""
        placeholder="Input new name, enter to confirm, esc or click away to cancel"
        inputProps={{
          className: "w-full outline-none",
        }}
      >
        <span className="font-bold cursor:pointer">New directory...</span>
      </InlineInput>
    </div>
  );
};

export default NewDirectoryListEntry;
