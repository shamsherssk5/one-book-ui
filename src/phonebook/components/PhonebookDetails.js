import React, { useState, useEffect } from "react";
import StarRatings from "react-star-ratings";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import Gap from "../../common/Gap";
import History from "../../common/History";
import moment from 'moment-timezone';
import axios from 'axios';
import { MessageBox } from "../../common/MessageBox";

const PhoneBookDetails = ({ rightContent, selectData, setData, setToken }) => {
  let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
  const handleDelete = (id) => {
    setData(prev => {
      let updatedData = prev.filter(cust => {
        if (cust.ID === selectData.ID) {
          let updatedAttach = cust.attachments.filter((a) => a.fileID != id);
          cust.attachments = updatedAttach;
        }
        return cust;
      })
      return updatedData;
    })
  }

  const handleUpload = (file) => {
    setData(prev => {
      let updatedData = prev.filter(cust => {
        if (cust.ID === selectData.ID) {
          cust.attachments.push(file);
        }
        return cust;
      })
      return updatedData;
    })
  }

  useEffect(async () => {
    if (!selectData) return;
    if (selectData.attachments && selectData.attachments.length > 0) return;
    if (rightContent !== "Details") return;
    await axios.get(process.env.REACT_APP_API_ENDPOINT + '/files/attachments?ID=phonebook' + selectData.ID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter(cust => {
            if (cust.ID === selectData.ID) {
              cust["attachments"] = res.data
            }
            return cust;
          })
          return updatedData;
        })
      }).catch(err => {
        console.log(err);
      })

  }, [selectData])


  useEffect(async () => {
    if (!selectData) return;
    if (selectData.history && selectData.history.length > 0) return;
    if (rightContent !== "Details") return;
    await axios.get(process.env.REACT_APP_API_ENDPOINT + '/common/history?ID=phonebook' + selectData.ID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter(cust => {
            if (cust.ID === selectData.ID) {
              cust["history"] = res.data
            }
            return cust;
          })
          return updatedData;
        })
      }).catch((err) => {
        console.log(err);
      })

  }, [selectData]);


  const handleOnSendMessage = (messageData) => {

    setData((prev) => {
      let updatedData = prev.filter(cust => {
        if (cust.ID === selectData.ID) {
          cust.conversations.push(messageData)
        }
        return cust;
      })
      return updatedData;
    })

  };


  useEffect(async () => {
    if (!selectData) return;
    if (selectData.conversations && selectData.conversations.length > 0) return;
    if (rightContent !== "Details") return;

    await axios.get(process.env.REACT_APP_API_ENDPOINT + '/common/conversations?ID=phonebook' + selectData.ID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter(cust => {
            if (cust.ID === selectData.ID) {
              cust["conversations"] = res.data
            }
            return cust;
          })
          return updatedData;
        })

      }).catch((err) => {
        console.log(err);
      })

  }, [selectData])


  return (
    rightContent === "Details" &&
    selectData !== undefined && (
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
                <tbody>
                  <tr className="table-heading">
                    <td className="left-td">Contact Ref#</td>
                    <td className="right-td">Rating</td>
                  </tr>
                  <tr>
                    <td className="table-heading category-dark">
                      {selectData.refText} {selectData.refNum}
                    </td>
                    <td className="table-heading category-dark">
                      <StarRatings
                        rating={selectData.rating}
                        starDimension="0.83vw"
                        starSpacing="0.1vw"
                        starRatedColor="#44B764"
                        starEmptyColor="#C4C4C4"
                        numberOfStars={5}
                        name="rating"
                      />
                    </td>
                  </tr>
                  <tr></tr>
                  <tr className="table-heading">
                    <td className="left-td">Company Name</td>
                  </tr>
                  <tr>
                    <td className="table-heading category-dark">
                      {selectData.companyName}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr className="table-heading">
                    <td className="left-td">Contact Person</td>
                  </tr>
                  <tr>
                    <td className="blue-heading">{selectData.contactPerson}</td>
                  </tr>
                  <tr></tr>
                  <td className="table-heading category-dark">
                    Contact Number
                  </td>
                  <tr className="table-heading">
                    <td className="left-td">{selectData.contactNumber.split(",").map(m => <div>+{m}</div>)}</td>
                  </tr>
                  <tr></tr>
                  <tr className="table-heading">
                    <td className="left-td">Created</td>
                  </tr>
                  <tr>
                    <td colSpan="2">
                      <table cellPadding="0" cellSpacing="0" width="100%" border="0">
                        <tbody>
                          <tr style={{ width: "100%!important" }}>
                            <td className="table-heading category-dark" >{selectData.createdBy}</td>
                            <td align="right" className="table-heading">{moment(selectData.creationTime.replace('T', ' ').replace('Z', '')).format(currentUser.dateFormat + (currentUser.timeFormat === "12 Hrs" ? " hh:mm A" : " HH:mm"))}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                  <tr></tr>
                  <tr>
                    <td className="blue-heading" colSpan="2">
                      Key Words / Work Type / Nature of Work
                    </td>
                  </tr>
                  <tr className="table-heading">
                    <td className="left-td">{selectData.keyWords}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Gap />
        {selectData && selectData.attachments && <FileUploaderListViewer isView={true} setToken={setToken} data={selectData.attachments} handleUpload={handleUpload} handleDelete={handleDelete} module="phonebook" id={'phonebook' + selectData.ID} />}
        <Gap />
        {selectData && selectData.conversations && <MessageBox setToken={setToken} data={selectData.conversations} currentUser={currentUser} handleOnSendMessage={handleOnSendMessage} moduleID={'phonebook' + selectData.ID} heading="Comments"></MessageBox>}
        <Gap/>
        {selectData && selectData.history && <History data={selectData.history} />}
      </div>
    )
  );
};

export default PhoneBookDetails;
