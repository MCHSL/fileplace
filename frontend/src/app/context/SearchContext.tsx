import useAxios from "axios-hooks";
import React, { useMemo } from "react";
import { BasicDirectory, UserFile } from "./DirectoryContext";

export interface SearchResults {
  directories: BasicDirectory[];
  files: UserFile[];
}

interface SearchState {
  searchLoading: boolean;
  searchError: any;
  searchResults: SearchResults;
  doSearch: (query: string) => void;
}

const SearchContext = React.createContext<SearchState>({} as SearchState);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [{ data, error, loading }, refetch] = useAxios("/search/", {
    manual: true,
  });

  const emptyData = useMemo(() => {
    return { directories: [], files: [] };
  }, []);

  const [previousData, setPreviousData] = React.useState<SearchResults>(
    emptyData as SearchResults
  );

  const searchRefetch = (query: string) => {
    setPreviousData(data);
    refetch({
      url: `/search?query=${query}`,
    });
  };

  const finalData = data || previousData || emptyData;

  return (
    <SearchContext.Provider
      value={{
        searchLoading: loading,
        searchError: error,
        searchResults: finalData,
        doSearch: searchRefetch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

const useSearch = () => React.useContext(SearchContext);
export default useSearch;
