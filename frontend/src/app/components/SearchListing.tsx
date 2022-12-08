import React, { useEffect } from "react";
import useSearch from "../context/SearchContext";
import FileList from "./directory_listing/FileStuff/FileList";
import { useDebounce } from "use-debounce";

const SearchListing = () => {
  const { searchLoading, searchResults, doSearch } = useSearch();
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 3) {
      doSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const refetch = () => {
    doSearch(searchTerm);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div>
      <div>
        <input
          type="text"
          value={searchTerm}
          placeholder="Search..."
          onChange={onSearchChange}
          className="border border-gray-300 rounded-md p-2 w-3/4"
        />
      </div>
      <div className="flex flex-col gap-4 justify-center">
        <FileList
          files={searchResults?.files}
          directoryLoading={searchLoading}
          directoryRefetch={refetch}
        />
      </div>
    </div>
  );
};

export default SearchListing;
