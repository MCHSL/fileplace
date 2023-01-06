import useAxios from "axios-hooks";
import React, { useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { BasicDirectory, UserFile } from "./DirectoryContext";

export interface SearchResults {
  directories: BasicDirectory[];
  files: UserFile[];
}

interface SearchState {
  query: string | null;
  searchLoading: boolean;
  searchError: any;
  searchResults: SearchResults;
  doSearch: (query: string, username: string) => void;
  clearSearch: () => void;
}

const SearchContext = React.createContext<SearchState>({} as SearchState);

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [query, setQuery] = React.useState<string | null>(null);
  const [{ data, error, loading }, refetch] = useAxios("/search", {
    manual: true,
  });

  const emptyData = useMemo(() => {
    return { directories: [], files: [] };
  }, []);

  const [previousData, setPreviousData] = React.useState<SearchResults>(
    emptyData as SearchResults
  );

  const searchRefetch = useCallback((query: string, username: string) => {
    setQuery(query);
    setPreviousData(data);
    if (!query || !username) return;
    refetch({
      url: `/search?query=${query}&username=${username}`,
    });
  }, []);

  const clearSearch = useCallback(() => {
    setPreviousData(emptyData);
  }, []);

  const dataAfterCache = data || previousData || emptyData;
  const finalData = {
    directories: dataAfterCache.directories.sort((a, b) =>
      a.name.localeCompare(b.name)
    ),
    files: dataAfterCache.files.sort((a, b) => a.name.localeCompare(b.name)),
  };

  return (
    <SearchContext.Provider
      value={{
        query,
        searchLoading: loading,
        searchError: error,
        searchResults: finalData,
        doSearch: searchRefetch,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

const useSearch = () => React.useContext(SearchContext);
export default useSearch;
