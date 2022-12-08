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
  setCurrentDirectoryId: (directory: number | null) => void;
  directoryRefetch: () => void;
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

  const finalData = data || previousData;

  return (
    <DirectoryContext.Provider
      value={{
        currentDirectory: finalData,
        setCurrentDirectoryId,
        directoryLoading: loading,
        directoryError: error,
        directoryRefetch: reloadDirectory,
      }}
    >
      {children}
    </DirectoryContext.Provider>
  );
};

const useDirectory = () => React.useContext(DirectoryContext);
export default useDirectory;
