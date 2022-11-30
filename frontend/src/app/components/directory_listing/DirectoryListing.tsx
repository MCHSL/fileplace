import React from "react";
import {
  BasicDirectory,
  Directory,
  UserFile,
} from "../../context/DirectoryContext";
import DirectoryListEntry from "./DirectoryListEntry";
import DirectoryPath from "./DirectoryPath";
import FileListEntry from "./FileListEntry";
import ParentDirectoryListEntry from "./ParentDirectoryListEntry";

export interface DirectoryListingProps {
  parentDirectory: BasicDirectory | null;
  path: BasicDirectory[];
  directories: BasicDirectory[];
  files: UserFile[];
}

const FileList = ({
  parentDirectory,
  path,
  directories,
  files,
}: DirectoryListingProps) => {
  return (
    <div className="divide-y border border-x-0 flex flex-col">
      <DirectoryPath path={path} />
      {parentDirectory ? (
        <ParentDirectoryListEntry
          key={parentDirectory.id}
          id={parentDirectory.id}
        />
      ) : null}
      {directories.map((dir) => (
        <DirectoryListEntry key={dir.id} directory={dir} />
      ))}
      {files.map((file) => (
        <FileListEntry key={file.id} file={file} />
      ))}
    </div>
  );
};

export default FileList;
