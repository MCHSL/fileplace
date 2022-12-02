import React, { useEffect } from "react";
import client from "../../../client";
import useDirectory from "../../../context/DirectoryContext";

const NewDirectoryListEntry = () => {
  const { currentDirectory, directoryRefetch } = useDirectory();
  const [adding, setAdding] = React.useState(false);
  const [name, setName] = React.useState("");
  const nameInputRef = React.useRef<HTMLInputElement>(null);

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
      .then(stopAdding);
  };

  const startAdding = () => {
    setAdding(true);
    setName("");
  };

  const stopAdding = () => {
    setAdding(false);
    setName("");
  };

  useEffect(() => {
    if (adding) {
      const input = nameInputRef.current;
      if (input) {
        input.focus();
      }
    }
  }, [adding]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      createDirectory(name);
    } else if (e.key === "Escape") {
      stopAdding();
    }
  };

  return (
    <div
      className="p-1 text-left hover:bg-slate-100 hover:cursor-pointer"
      onClick={() => {
        startAdding();
      }}
    >
      {adding ? (
        <input
          type="text"
          ref={nameInputRef}
          value={name}
          placeholder={
            "Type in name, enter to confirm, esc or click away to cancel"
          }
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={stopAdding}
          className="w-full focus:outline-none"
        />
      ) : (
        <span className="font-bold cursor:pointer">New directory...</span>
      )}
    </div>
  );
};

export default NewDirectoryListEntry;
