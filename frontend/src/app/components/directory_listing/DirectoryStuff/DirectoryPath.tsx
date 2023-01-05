import { faLock, faUnlockAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import client from "../../../client";
import useDirectory from "../../../context/DirectoryContext";
import useUser from "../../../context/UserContext";

const DirectoryPath = () => {
  const { currentDirectory, setCurrentDirectoryId, directoryRefetch } =
    useDirectory();
  const { user } = useUser();

  const togglePrivate = () => {
    client
      .post("/directory/set_private", {
        directory: currentDirectory?.id,
        private: !currentDirectory?.private,
      })
      .then(directoryRefetch);
  };

  if (!currentDirectory) {
    return null;
  }

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

  const padlock =
    user?.id != currentDirectory?.user.id ? (
      <></>
    ) : (
      <span className="p-1 flex hover:cursor-pointer" onClick={togglePrivate}>
        {currentDirectory?.private ? (
          <FontAwesomeIcon icon={faLock} fixedWidth className="text-red-500" />
        ) : (
          <FontAwesomeIcon
            icon={faUnlockAlt}
            fixedWidth
            className="text-green-500"
          />
        )}
      </span>
    );

  return (
    <div className="text-left flex gap-1">
      {padlock}
      {pathElements}
    </div>
  );
};

export default DirectoryPath;
