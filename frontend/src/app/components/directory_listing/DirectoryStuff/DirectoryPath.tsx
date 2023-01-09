import {
  faLock,
  faUnlockAlt,
  faShareSquare,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React from "react";
import client from "../../../client";
import useDirectory from "../../../context/DirectoryContext";
import useUser from "../../../context/UserContext";

const DirectoryPath = () => {
  const { currentDirectory, setCurrentDirectoryId, directoryRefetch } =
    useDirectory();
  const [showCopy, setShowCopy] = React.useState(false);
  const { user } = useUser();

  const togglePrivate = () => {
    client
      .post("/directory/set_private", {
        directory: currentDirectory?.id,
        private: !currentDirectory?.private,
      })
      .then(directoryRefetch);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location}`);
    setShowCopy(true);
    setTimeout(() => {
      setShowCopy(false);
    }, 2000);
  };

  if (!currentDirectory) {
    return null;
  }

  const path = currentDirectory?.path || [];

  const pathElements = path.map((dir) => (
    <span key={dir.id} className="flex">
      {dir.id == currentDirectory?.id ? (
        <span className="cursor-default mx-1">{dir.name}</span>
      ) : (
        <span
          className="cursor-pointer underline text-blue-500 mx-1"
          onClick={() => setCurrentDirectoryId(dir.id)}
        >
          {dir.name}
        </span>
      )}
      <span className="cursor-default text-gray-500">{">"}</span>
    </span>
  ));

  const padlock =
    user?.id != currentDirectory?.user.id ? (
      <span className="flex relative">
        <FontAwesomeIcon
          icon={faShareSquare}
          fixedWidth
          className="text-blue-500 hover:cursor-pointer text-lg ml-1"
          onClick={copyLink}
        />
        {showCopy && (
          <span className="text-green-500 absolute top-5 font-bold">
            Copied!
          </span>
        )}
      </span>
    ) : (
      <span className="flex relative">
        {currentDirectory?.private ? (
          <FontAwesomeIcon
            icon={faLock}
            fixedWidth
            className="text-red-500 hover:cursor-pointer text-lg"
            onClick={togglePrivate}
          />
        ) : (
          <>
            <FontAwesomeIcon
              icon={faUnlockAlt}
              fixedWidth
              className="text-green-500 hover:cursor-pointer text-lg mr-1"
              onClick={togglePrivate}
            />
            <FontAwesomeIcon
              icon={faShareSquare}
              fixedWidth
              className="text-blue-500 hover:cursor-pointer text-lg ml-1"
              onClick={copyLink}
            />
            {showCopy && (
              <span className="text-green-500 absolute top-5 font-bold">
                Copied!
              </span>
            )}
          </>
        )}
      </span>
    );

  return (
    <div className="text-left flex gap-1">
      <span className="flex flex-row justify-center items-center">
        {padlock}
        <span className="ml-2 flex flex-row gap-0">{pathElements}</span>
      </span>
    </div>
  );
};

export default DirectoryPath;
