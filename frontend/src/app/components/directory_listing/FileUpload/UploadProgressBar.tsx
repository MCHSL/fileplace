import { AxiosProgressEvent } from "axios";
import React from "react";
import { humanFileSize, humanTime } from "../../../helpers";

interface UploadProgressBarProps {
  filename: string | undefined;
  uploadEventData: AxiosProgressEvent | null;
}

const UploadProgressBar = ({
  filename,
  uploadEventData,
}: UploadProgressBarProps) => {
  let containerClasses =
    "flex flex-col justify-center transition-all duration-500 transform-origin-bottom";
  if (!uploadEventData) {
    containerClasses += " scale-y-0 max-h-0";
  } else {
    containerClasses += " scale-y-100 max-h-100";
  }

  const percent = uploadEventData?.progress
    ? `${Math.round(uploadEventData.progress * 100)}%`
    : "0%";

  let estimatedTime;

  if ((uploadEventData?.estimated || 0) <= 1) {
    estimatedTime = "soon";
  } else {
    estimatedTime =
      "in " + humanTime(Math.ceil(uploadEventData?.estimated || 0));
  }

  return (
    <div className={containerClasses}>
      <span className="flex text-center m-auto">{filename}</span>
      <div className="flex flex-row justify-center gap-2 w-3/4 m-auto">
        <span className="overflow-hidden my-2 align-middle w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-100 ease-linear"
            style={{
              width: percent,
            }}
          ></div>
        </span>
        <span className="text-right flex-shrink w-0 align-middle">
          {percent}
        </span>
      </div>
      <span className="flex text-center m-auto">
        {humanFileSize(uploadEventData?.rate || 0)}/s, complete {estimatedTime}
        {}
      </span>
    </div>
  );
};

export default UploadProgressBar;
