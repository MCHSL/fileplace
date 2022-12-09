import useAxios from "axios-hooks";
import React, { useEffect } from "react";

export interface UserFile {
  id: number;
  name: string;
}

export interface BasicDirectory {
  id: number;
  name: string;
  parent: number;
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
  setFilter: (filter: string | null) => void;
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
  const [previousData, setPreviousData] = React.useState();
  const [filter, setFilter] = React.useState<string | null>(null);

  const [{ data, error, loading }, refetch] = useAxios("/directory/", {
    manual: true,
  });

  const reloadDirectory = () => {
    if (currentDirectoryId) {
      setPreviousData(data);
      refetch({
        url: `/directory/${currentDirectoryId}`,
      });
    }
  };

  useEffect(() => {
    reloadDirectory();
  }, [currentDirectoryId]);

  let dataAfterCache = data || previousData;
  if (filter) {
    console.log("filter", filter);
    dataAfterCache = {
      ...dataAfterCache,
      files: dataAfterCache?.files.filter((file) => file.name.includes(filter)),
      children: dataAfterCache?.children.filter((child) =>
        child.name.includes(filter)
      ),
    };
  }

  return (
    <DirectoryContext.Provider
      value={{
        currentDirectory: dataAfterCache,
        setCurrentDirectoryId,
        directoryLoading: loading,
        directoryError: error,
        directoryRefetch: reloadDirectory,
        filter,
        setFilter,
      }}
    >
      {children}
    </DirectoryContext.Provider>
  );
};

const useDirectory = () => React.useContext(DirectoryContext);
export default useDirectory;
