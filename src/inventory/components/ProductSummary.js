import axios from "axios";
import React, { useEffect } from "react";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import Gap from "../../common/Gap";
import History from "../../common/History";
import OneBookDiscussion from "../../discussion/OneBookDiscussion";
import CustomComponent from "../../discussion/OneBookDiscussion";
import TOTAL_In_Stock from "../assets/totalinstock.png";
import TOTA_OUT_Stock from "../assets/totaloutstock.png";
import InventoryDiscussion from "./InventoryDiscussion";

const ProductSummary = ({
  rightContent,
  currentInventory,
  setData,
  setToken,
}) => {
  const handleDelete = (id) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.invID === currentInventory.invID) {
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
        if (cust.invID === currentInventory.invID) {
          cust.attachments.push(file);
        }
        return cust;
      });
      return updatedData;
    });
  };

  useEffect(async () => {
    if (!currentInventory) return;
    if (currentInventory.attachments && currentInventory.attachments.length > 0)
      return;
    if (rightContent !== "Product Summary") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/files/attachments?ID=inv" +
          currentInventory.invID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.invID === currentInventory.invID) {
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
  }, [currentInventory, rightContent]);

  useEffect(async () => {
    if (!currentInventory) return;
    if (currentInventory.history && currentInventory.history.length > 0) return;
    if (rightContent !== "Product Summary") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/history?ID=inv" +
          currentInventory.invID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.invID === currentInventory.invID) {
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
  }, [currentInventory, rightContent]);

  return (
    rightContent === "Product Summary" && (
      <div className="task-details-box">
        <div className="task-details-container">
          <div className="details-container">
            <div className="user-details-container">
              <table
                className="equalDivide"
                cellPadding="0"
                cellSpacing="0"
                width="100%"
                border="0"
              >
                <tbody className="table-heading">
                  <tr>
                    <td width="15%">
                      <img className="total_in_img" src={TOTAL_In_Stock} />
                    </td>
                    <td width="40%" className="category-dark">
                      Total In
                    </td>
                    <td width="45%" align="right">
                      {currentInventory.vendor
                        .filter((v) => v.moveType === "Received")
                        .map((v) => parseInt(v.qty))
                        .reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                  <tr />
                  <tr>
                    <td>
                      <img className="total_out_img" src={TOTA_OUT_Stock} />
                    </td>
                    <td className="category-dark">Total Out</td>
                    <td align="right">
                      {currentInventory.vendor
                        .filter((v) => v.moveType !== "Received")
                        .map((v) => parseInt(v.qty))
                        .reduce((a, b) => a + b, 0)}
                    </td>
                  </tr>
                  <tr />
                  <tr />
                  <tr />
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="available_stock">
          <div className="total-available-container">
            <table
              className="equalDivide"
              cellPadding="0"
              cellSpacing="0"
              width="100%"
              border="0"
            >
              <tbody className="table-heading">
                <tr>
                  <td width="15%"></td>
                  <td width="40%">Available Stock</td>
                  <td width="45%" align="right">
                    {currentInventory.vendor
                      .map((v) =>
                        v.moveType === "Received"
                          ? parseInt(v.qty)
                          : -parseInt(v.qty)
                      )
                      .reduce((a, b) => a + b, 0)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <Gap />
        <div className="messages task-details-container">
          <div className="message-Heading">Discussions</div>
        </div>
        <div className="empty-details-container blue-border"></div>
        <InventoryDiscussion
          rightContent={rightContent}
          currentInventory={currentInventory}
          setToken={setToken}
          setData={setData}
        />
        <Gap />
        {currentInventory && currentInventory.attachments && (
          <FileUploaderListViewer
            isView={true}
            setToken={setToken}
            data={currentInventory.attachments}
            handleUpload={handleUpload}
            handleDelete={handleDelete}
            module="inv"
            id={"inv" + currentInventory.invID}
          />
        )}
        <Gap />
        {currentInventory && currentInventory.history && (
          <History data={currentInventory.history} />
        )}
      </div>
    )
  );
};

export default ProductSummary;
