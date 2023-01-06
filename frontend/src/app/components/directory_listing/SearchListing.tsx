import React, { useEffect } from "react";
import useSearch from "../../context/SearchContext";
import FileList from "./FileStuff/FileList";
import { useDebounce } from "use-debounce";
import { useNavigate, useParams } from "react-router-dom";
import DirectoryList from "./DirectoryStuff/DirectoryList";

const SearchListing = () => {
  const username = useParams<{ username: string }>().username || "";
  const { query, searchLoading, searchResults, doSearch } = useSearch();
  const [searchTerm, setSearchTerm] = React.useState<string>(query || "");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const navigate = useNavigate();

  useEffect(() => {
    doSearch(debouncedSearchTerm, username);
  }, [debouncedSearchTerm, username]);

  const refetch = () => {
    doSearch(searchTerm, username);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const doGoBack = () => {
    console.log("hello?");
    navigate(`/user/${username}/`);
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
        <button
          onClick={doGoBack}
          className="
		  bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded m-1
		"
        >
          Back to listing
        </button>
      </div>
      <div className="flex flex-col gap-4 justify-center">
        <DirectoryList
          directories={searchResults?.directories}
          currentDirectory={null}
          directoryLoading={searchLoading}
          directoryRefetch={refetch}
        />
      </div>
      <div className="flex flex-col gap-4 justify-center">
        <FileList
          owned={true}
          files={searchResults?.files}
          directoryLoading={searchLoading}
          directoryRefetch={refetch}
        />
      </div>
    </div>
  );
};

export default SearchListing;
