import React from "react";
import useDirectory from "../../../context/DirectoryContext";

const DirectoryPath = () => {
  const { currentDirectory, setCurrentDirectoryId } = useDirectory();

  const path = currentDirectory?.path || [];

  const pathElements = path.map((dir) => (
    <span key={dir.id} className="flex gap-1">
      {dir.id == currentDirectory?.id ? (
        <span className="cursor-default">{dir.name}</span>
      ) : (
        <span
          className="cursor-pointer underline text-blue-500"
          onClick={() => setCurrentDirectoryId(dir.id)}
        >
          {dir.name}
        </span>
      )}
      <span className="text-gray-500">{">"}</span>
    </span>
  ));

  return <div className="text-left flex gap-1">{pathElements}</div>;
};

export default DirectoryPath;
