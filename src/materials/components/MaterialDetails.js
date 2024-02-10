import axios from "axios";
import React, { useEffect } from "react";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import Gap from "../../common/Gap";
import History from "../../common/History";

const MaterialDetails = ({
  currentMaterial,
  setToken,
  setData,
  rightContent,
}) => {
  const handleDelete = (id) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.prodID === currentMaterial.prodID) {
          let updatedAttach = cust.attachments.filter((a) => a.fileID != id);
          cust.attachments = updatedAttach;
        }
        return cust;
      });
      return updatedData;
    });
  };

  const handleUpload = (file) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.prodID === currentMaterial.prodID) {
          cust.attachments.push(file);
        }
        return cust;
      });
      return updatedData;
    });
  };

  useEffect(async () => {
    if (!currentMaterial) return;
    if (currentMaterial.attachments && currentMaterial.attachments.length > 0)
      return;
    if (rightContent !== "Details") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/files/attachments?ID=pnm" +
          currentMaterial.prodID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.prodID === currentMaterial.prodID) {
              cust["attachments"] = res.data;
            }
            return cust;
          });
          return updatedData;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentMaterial]);

  useEffect(async () => {
    if (!currentMaterial) return;
    if (currentMaterial.history && currentMaterial.history.length > 0) return;
    if (rightContent !== "Details") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/history?ID=pnm" +
          currentMaterial.prodID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.prodID === currentMaterial.prodID) {
              cust["history"] = res.data;
            }
            return cust;
          });
          return updatedData;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentMaterial]);

  return (
    <div className="task-details-box mtr">
      {currentMaterial && currentMaterial.attachments && (
        <FileUploaderListViewer
          isView={true}
          setToken={setToken}
          data={currentMaterial.attachments}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          module="pnm"
          id={"pnm" + currentMaterial.prodID}
        />
      )}
      <Gap />
      {currentMaterial && currentMaterial.history && (
        <History data={currentMaterial.history} />
      )}
    </div>
  );
};

export default MaterialDetails;
