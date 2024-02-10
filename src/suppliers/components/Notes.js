import React, { useEffect, useState } from "react";
import "../../common/styles/customer-supplier-common.css";
import HistoryImg from "../../tasks/assets/history.png";
import NoteDel from "../../assets/images/Note-Del.png";
import NoteEdit from "../../assets/images/Note-Edit.png";
import axios from "axios";
import toast from "react-hot-toast";
import moment from "moment-timezone";

const Notes = ({
  slectedSubMenu,
  data,
  setData,
  currentCustomer,
  setToken,
}) => {
  const [hCount, sethCount] = useState(3);
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let emptyNote = {
    note: "",
    supID: currentCustomer.supID,
    created_by: currentUser.username,
    note_time: "",
  };
  const [noteData, setNoteData] = useState(emptyNote);
  const [SubmitButton, setSubmitButton] = useState("ADD NOTE");
  const handleCount = () => {
    if (hCount >= data.length) {
      sethCount(3);
    } else {
      sethCount((c) => c + 3);
    }
  };

  const handleDelete = async (note) => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/suppliers/delete-note",
        { id: note.id },
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.supID === currentCustomer.supID) {
              let updatedNotes = cust.notes.filter((a) => a.id != note.id);
              cust.notes = updatedNotes;
            }
            return cust;
          });
          return updatedData;
        });
        toast.success("Note deleted successfully");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Note Deletion Failed..!");
      });
  };

  const handleEdit = (d) => {
    setSubmitButton("UPDATE");
    setNoteData(d);
  };

  const handleSaves = async () => {
    let d = new Date(
      new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
    );
    if (noteData.note.trim().length <= 0) {
      toast.error("Note can't be empty");
      return;
    }
    noteData.note_time =
      d.getFullYear().toString() +
      "-" +
      (d.getMonth() + 1).toString() +
      "-" +
      d.getDate().toString() +
      " " +
      d.getHours().toString() +
      ":" +
      d.getMinutes().toString() +
      ":" +
      d.getSeconds().toString();
    if (SubmitButton === "ADD NOTE") {
      setSubmitButton("...Saving");
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/suppliers/create-note",
          noteData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          noteData["id"] = res.data.insertId;
          setSubmitButton("ADD NOTE");
          setData((prev) => {
            let updatedData = prev.filter((cust) => {
              if (cust.supID === currentCustomer.supID) {
                cust.notes.unshift(noteData);
              }
              return cust;
            });
            return updatedData;
          });
          toast.success("Note Added Successfully");
          setNoteData(emptyNote);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Note creation failed");
          setSubmitButton("ADD NOTE");
        });
    } else if (SubmitButton === "UPDATE") {
      setSubmitButton("...Saving");
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/suppliers/update-note",
          noteData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setSubmitButton("ADD NOTE");
          toast.success("Note Updated successfully");
          setData((prev) => {
            let updatedData = prev.filter((cust) => {
              if (cust.supID === currentCustomer.supID) {
                let updateNote = cust.notes.filter((n) => {
                  if (n.id === noteData.id) {
                    n.note = noteData.note;
                  }
                  return n;
                });
                cust.notes = updateNote;
              }
              return cust;
            });
            return updatedData;
          });
          setNoteData(emptyNote);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Note updation failed");
          setSubmitButton("UPDATE");
        });
    }
  };

  useEffect(async () => {
    setNoteData(emptyNote);
    setSubmitButton("ADD NOTE");
    if (!currentCustomer) return;
    if (slectedSubMenu !== "Notes") return;
    if (
      currentCustomer &&
      currentCustomer.notes &&
      currentCustomer.notes.length > 0
    )
      return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/suppliers/sup-notes?ID=" +
          currentCustomer.supID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.supID === currentCustomer.supID) {
              cust["notes"] = res.data.filter(
                (d) => d.note && d.note.length > 0
              );
            }
            return cust;
          });
          return updatedData;
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }, [currentCustomer, slectedSubMenu]);

  return (
    slectedSubMenu === "Notes" && (
      <div className="notes-container">
        <div className="notes-adder-container">
          <span className="notes-adder-header">Description</span>
          <input
            type="text"
            className="notes-add-input"
            value={noteData.note}
            placeholder="Enter Here..."
            onChange={(e) => setNoteData({ ...noteData, note: e.target.value })}
          ></input>
          <button id="next" className="notes-add-button" onClick={handleSaves}>
            {SubmitButton}
          </button>
        </div>
        <div className="notes-content-container">
          <div class="rb-container">
            <ul class="rb">
              {data &&
                data
                  .filter((d, i) => i < hCount)
                  .map((h) => (
                    <li class="rb-item cust-sup-notes">
                      <table className="history-table notes-table" index={h.id}>
                        <tbody>
                          <tr>
                            <td align="left">
                              <p className="notes-data-text">{h.note}</p>
                              <p className="notes-data-info">
                                created by {h.created_by} on{" "}
                                {moment(
                                  h.note_time.replace("T", " ").replace("Z", "")
                                ).format(
                                  currentUser.dateFormat +
                                    (currentUser.timeFormat === "12 Hrs"
                                      ? " hh:mm A"
                                      : " HH:mm")
                                )}
                              </p>
                            </td>
                            <td align="right">
                              <img
                                className="notes-edit"
                                src={NoteEdit}
                                onClick={() => handleEdit(h)}
                              />
                              <img
                                className="notes-delete"
                                src={NoteDel}
                                onClick={() => handleDelete(h)}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </li>
                  ))}
            </ul>
            {data && data.length > 0 && (
              <img
                className={
                  hCount >= data.length ? "history-img rotate" : "history-img"
                }
                title={hCount >= data.length ? "See Less" : "See More"}
                src={HistoryImg}
                onClick={handleCount}
              />
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default Notes;
