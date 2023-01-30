import { AxiosProgressEvent } from "axios";
import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import client from "../../../client";
import useDirectory from "../../../context/DirectoryContext";
import UploadProgressBar from "./UploadProgressBar";

const FileUpload = () => {
  const { currentDirectory, directoryRefetch } = useDirectory();

  const [uploadEventData, setUploadEventData] =
    React.useState<AxiosProgressEvent | null>(null);
  const [uploadingFile, setUploadingFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const onUploadProgress = useCallback((progressEvent) => {
    setUploadEventData(progressEvent);
  }, []);

  const onDrop = useCallback(
    (acceptedFiles) => {
      console.log("acceptedFiles", acceptedFiles);
      if (!currentDirectory) {
        console.log("no user or current directory");
        return;
      }
      setUploadingFile(acceptedFiles[0]);
      setError("");
      const data = new FormData();
      data.append("file", acceptedFiles[0]);
      data.append("directory", currentDirectory.id.toString());
      client
        .post("/file/upload", data, { onUploadProgress })
        .then(directoryRefetch)
        .catch(() => {
          setError("An error occured during upload, please try again.");
        })
        .finally(() => {
          setUploadEventData(null);
          setUploadingFile(null);
        });
    },
    [currentDirectory]
  );
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
  });

  let promptClassNames =
    "text-center transition-all duration-500 transform-origin-top";
  if (uploadingFile) {
    promptClassNames += " scale-y-0 max-h-0";
  } else {
    promptClassNames += " scale-y-100 max-h-100";
  }

  let containerClassNames =
    "w-1/2 py-4 flex flex-col m-auto justify-between my-5 border hover:cursor-pointer hover:border-blue-500 hover:border-2 h-24";
  if (isDragActive) {
    containerClassNames += " border-dashed border-4 border-blue-500";
  }

  return (
    <div {...getRootProps()} className={containerClassNames}>
      <input {...getInputProps()} />
      <div className={promptClassNames}>
        <div>Drag 'n' drop some files here, or click to select files</div>
        <div className="text-red-500">{error}</div>
      </div>
      <UploadProgressBar
        filename={uploadingFile?.name}
        uploadEventData={uploadEventData}
      />
    </div>
  );
};

export default FileUpload;
