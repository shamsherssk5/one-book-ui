import React from "react";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";

const QuoteCreateInfo = ({
  rightContent,
  setToken,
  files,
  setFiles,
  editOrRevise,
}) => {
  const handleDelete = (id) => {
    setFiles((prev) => {
      let f = prev.filter((file) => file.fileID !== id);
      return f;
    });
  };

  const handleUpload = (file) => {
    setFiles((prev) => {
      return [...prev, file];
    });
  };

  return (
    rightContent === "Create" && (
      <div className="task-details-box">
        {!editOrRevise && (
          <FileUploaderListViewer
            isView={false}
            setToken={setToken}
            data={files}
            handleUpload={handleUpload}
            handleDelete={handleDelete}
            module="quote"
            id={undefined}
          />
        )}
      </div>
    )
  );
};

export default QuoteCreateInfo;
