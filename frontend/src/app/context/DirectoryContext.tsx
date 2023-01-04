import useAxios from "axios-hooks";
import React, { useCallback, useEffect, useMemo } from "react";
import client from "../client";
import useUser, { User } from "./UserContext";

export interface UserFile {
  id: number;
  name: string;
  private: boolean;
  user: User;
}

export interface BasicDirectory {
  id: number;
  name: string;
  parent: number;
  private: boolean;
  user: User;
}

export interface Directory extends Omit<BasicDirectory, "parent"> {
  parent: BasicDirectory | null;
  children: BasicDirectory[];
  path: BasicDirectory[];
  files: UserFile[];
}

interface DirectoryState {
  currentDirectory: Directory | null;
  directoryLoading: boolean;
  directoryError: any;
  filter: string | null;
  setCurrentDirectoryId: (directory: number | null) => void;
  directoryRefetch: () => void;
  directoryClear: () => void;
  directoryCancel: () => void;
  setFilter: (filter: string | null) => void;
  renameFile: (fileId: number, newName: string) => Promise<void>;
}

const DirectoryContext = React.createContext<DirectoryState>(
  {} as DirectoryState
);

export const DirectoryProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentDirectoryId, setCurrentDirectoryId] = React.useState<
    number | null
  >();
  const [data, setData] = React.useState<Directory | null>(null);
  const [error, setError] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [previousData, setPreviousData] = React.useState<Directory | null>(
    null
  );
  const [filter, setFilter] = React.useState<string | null>(null);
  const [renamedFile, setRenamedFile] = React.useState<any>(null);

  const { user, userLoading } = useUser();

  const [abortController, setAbortController] =
    React.useState<AbortController | null>();

  const directoryRefetch = useCallback(() => {
    if (currentDirectoryId && !userLoading) {
      setPreviousData(data);
      const abortController = new AbortController();
      setAbortController(abortController);
      client
        .get(`/directory/${currentDirectoryId}`, {
          signal: abortController.signal,
        })
        .then((response) => {
          setData(response.data);
          setError(null);
        })
        .catch((error) => {
          setError(error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [currentDirectoryId, userLoading]);

  const directoryCancel = () => {
    abortController?.abort();
    setAbortController(null);
  };

  const directoryClear = () => {
    setCurrentDirectoryId(null);
    setData(null);
    setPreviousData(null);
  };

  const renameFile = async (fileId: number, newName: string) => {
    const originalName = data?.files.find((file) => file.id === fileId)?.name;
    if (!originalName) {
      return;
    }

    setData((prev) => {
      let file = prev?.files.find((file) => file.id === fileId);
      if (file) {
        file.name = newName;
      }
      return prev;
    });

    setRenamedFile({ fileId, originalName, newName });
  };

  useEffect(() => {
    directoryRefetch();
  }, [currentDirectoryId, user, userLoading]);

  useEffect(() => {
    if (renamedFile) {
      client
        .post("/file/rename", {
          file: renamedFile.fileId,
          name: renamedFile.newName,
        })
        .then(directoryRefetch)
        .catch(() => {
          setData((prev) => {
            let file = prev?.files.find(
              (file) => file.id === renamedFile.fileId
            );
            if (file) {
              file.name = renamedFile.originalName;
            }
            return prev;
          });
        })
        .finally(() => {
          setRenamedFile(null);
        });
    }
  }, [renamedFile]);

  let dataAfterCache = data || previousData;

  if (dataAfterCache && filter) {
    dataAfterCache.files = dataAfterCache?.files.filter((file) =>
      file.name.includes(filter)
    );
    dataAfterCache.children = dataAfterCache?.children.filter((child) =>
      child.name.includes(filter)
    );
  }

  if (dataAfterCache) {
    const compare = (a, b) => {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    };
    dataAfterCache.files = dataAfterCache.files.sort(compare);
    dataAfterCache.children = dataAfterCache.children.sort(compare);
  }

  return (
    <DirectoryContext.Provider
      value={{
        currentDirectory: dataAfterCache,
        setCurrentDirectoryId,
        directoryLoading: loading,
        directoryError: error,
        directoryRefetch,
        directoryClear,
        directoryCancel,
        filter,
        setFilter,
        renameFile,
      }}
    >
      {children}
    </DirectoryContext.Provider>
  );
};

const useDirectory = () => React.useContext(DirectoryContext);
export default useDirectory;
