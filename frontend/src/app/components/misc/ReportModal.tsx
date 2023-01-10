import React, { useEffect } from "react";
import client from "../../client";
import { UserFile, BasicDirectory } from "../../context/DirectoryContext";
import { User } from "../../context/UserContext";

interface ReportProps {
  show: boolean;
  user: User;
  file: UserFile | null;
  directory: BasicDirectory;
  close: () => void;
}

const ReportModal = ({ show, user, file, directory, close }: ReportProps) => {
  const [reason, setReason] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    setSubmitting(true);
    client
      .post("/report/create", {
        reason,
        user: user?.id,
        file: file?.id || null,
        directory: directory?.id,
      })
      .then(() => {
        close();
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  useEffect(() => {
    if (show && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [show]);

  return (
    <div
      data-show={!!show}
      className="fixed top-0 left-0 right-0 z-50 mx-auto w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-screen md:h-full backdrop-brightness-50 data-[show=false]:hidden"
    >
      <div className="relative top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 max-w-3xl max-h-3xl">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex flex-col justify-between">
            <span className="place-self-center">Report</span>
            <div className="flex flex-col mb-4">
              <span>{`User: ${user.username}`}</span>
              {file && <span>{`File: ${file.name}`}</span>}
              <span>{`Directory: ${directory.name}`}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-left">Reason:</span>
              <textarea
                maxLength={1000}
                className="border border-slate-500 p-2 rounded focus:border-slate-500"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus={true}
                ref={textAreaRef}
              />
              <span className="text-right">{reason.length}/1000</span>
            </div>
            <div className="flex flex-row gap-3 justify-center">
              <button
                onClick={submit}
                disabled={submitting}
                className="border border-slate-500 max-w-max p-2 rounded place-self-center"
              >
                Submit
              </button>
              <button
                onClick={close}
                className="border border-slate-500 max-w-max p-2 rounded place-self-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportModal;
