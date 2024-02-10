import React, { useEffect, useState } from "react";
import axios from "axios";
import moment from "moment-timezone";
import toast from "react-hot-toast";
import "./locationStyle.css";
export const Location = ({
  setNext,
  setToken,
  actionName,
  setactionName,
  loading,
}) => {
  const [error, setError] = useState(false);
  let emptyLocation = {
    timeZone: "",
    timeFormat: "",
    dateFormat: "",
  };

  const [formData, setformData] = useState(emptyLocation);

  const [submitValue, setSubmitValue] = useState("Next");

  const [timeZoneList, settimeZoneList] = useState(
    moment.tz.names().map((item, index) => {
      let data = { id: index + 1, key: item, value: item };
      return data;
    })
  );
  const [timeformateList, settimeformateList] = useState([
    {
      id: 1,
      key: "12",
      value: "12 Hrs",
    },
    {
      id: 2,
      key: "24",
      value: "24 Hrs",
    },
  ]);
  const [dateformateList, setdateformateList] = useState([
    {
      id: 1,
      key: "ddMMMyyyy",
      value: "DD MMM yyyy",
      text: "00 Jan 2000",
    },
    {
      id: 2,
      key: "MMMddyyyy",
      value: "MMM DD yyyy",
      text: "Jan 00 2000",
    },
    {
      id: 3,
      key: "dd-MM-yyyy",
      value: "DD-MM-yyyy",
      text: "DD-MM-2000",
    },
    {
      id: 4,
      key: "MM-dd-yyyy",
      value: "MM-DD-yyyy",
      text: "MM-DD-2000",
    },
  ]);

  useEffect(async () => {
    let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
    if (actionName !== "Location") return;
    if (formData.id) return;
    if (currentUser && currentUser.orgID === 0) {
      setformData(emptyLocation);
      alert("Please Update Organization");
      setactionName("Organization");
      return;
    } else {
      loading({ visibility: true, message: "Loading Location..." });
      await axios
        .get(
          process.env.REACT_APP_API_ENDPOINT +
            "/settings/getLocation?ID=" +
            currentUser.orgID,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          if (res.data.length > 0) {
            setformData(res.data[0]);
          } else {
            setformData(emptyLocation);
          }

          loading({ visibility: false });
        })
        .catch((err) => {
          console.log(err);
          loading({ visibility: false });
        });
    }
  }, [actionName]);

  const handleOnChange = (e) => {
    if (e) setformData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    if (formData.orgID !== 0) {
      setSubmitValue("Update");
    } else {
      setSubmitValue("Save");
    }
  };
  const formValidation = () => {
    return Object.keys(formData).some((key) => {
      console.log(key + "-" + formData[key]);
      return formData[key].toString().trim().length == 0;
    });
  };
  const handleNext = async (e) => {
    e.preventDefault();
    let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
    currentUser.timeFormat = formData.timeFormat;
    currentUser.timeZone = formData.timeZone;
    currentUser.dateFormat = formData.dateFormat;

    if (submitValue === "Next") {
      setNext();
      return;
    }
    if (formValidation()) {
      setError("Please fill out all the mandatory fields");
      return;
    } else {
      setError(undefined);
      if (submitValue === "Update") {
        setSubmitValue("...Updating");
        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT + "/settings/updateLocation",
            formData,
            { headers: { Authorization: window.localStorage.getItem("token") } }
          )
          .then((res) => {
            if (res.data.error) {
              setToken(undefined);
            }
            toast.success("Location data updated Sucessfully");
            window.localStorage.setItem(
              "currentUser",
              JSON.stringify(currentUser)
            );
            setSubmitValue("Next");
          })
          .catch((err) => {
            console.log(error);
            toast.error("Location updation Failed");
            setSubmitValue("Next");
          });
      } else {
        setSubmitValue("...Saving");
        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT +
              "/settings/createLocation?orgID=" +
              currentUser.orgID,
            formData,
            { headers: { Authorization: window.localStorage.getItem("token") } }
          )
          .then((res) => {
            if (res.data.error) {
              setToken(undefined);
            }

            setformData((prev) => ({
              ...prev,
              id: res.data.id,
              orgID: currentUser.orgID,
            }));
            toast.success("Location data saved Sucessfully");
            window.localStorage.setItem(
              "currentUser",
              JSON.stringify(currentUser)
            );
            setSubmitValue("Next");
          })
          .catch((err) => {
            console.log(error);
            toast.error("Location creation Failed");
            setSubmitValue("Next");
          });
      }
    }
  };

  return (
    actionName === "Location" && (
      <div id="location">
        <div class="location-main-container create-task-container">
          <form
            id="location-entryForm"
            name="location"
            autoComplete="off"
            noValidate
          >
            {error ? (
              <div>
                <span style={{ fontSize: "0.73vw", color: "red" }}>
                  {error}{" "}
                </span>
              </div>
            ) : (
              ""
            )}
            <div className="location-entry-div">
              <fieldset>
                <legend>Time Zone </legend>
                <select
                  className="title"
                  id="timeZone"
                  name="timeZone"
                  value={formData.timeZone}
                  onChange={handleOnChange}
                  required
                >
                  <option value="" disabled selected>
                    Select-{" "}
                  </option>
                  {timeZoneList &&
                    timeZoneList.map((item) => {
                      return (
                        <option style={{ color: "#353e46" }} value={item.value}>
                          {item.value}
                        </option>
                      );
                    })}
                </select>
              </fieldset>
              <fieldset>
                <legend>Time Format </legend>
                <select
                  className="title"
                  id="timeFormat"
                  name="timeFormat"
                  value={formData.timeFormat}
                  onChange={handleOnChange}
                  required
                >
                  <option value="" disabled selected>
                    Select-{" "}
                  </option>
                  {timeformateList &&
                    timeformateList.map((item) => {
                      return (
                        <option
                          id={item.id}
                          key={item.key}
                          style={{ color: "#353e46" }}
                          value={item.value}
                        >
                          {item.value}
                        </option>
                      );
                    })}
                </select>
              </fieldset>
              <fieldset>
                <legend>Date Format </legend>
                <select
                  className="title"
                  id="dateFormat"
                  name="dateFormat"
                  value={formData.dateFormat}
                  onChange={handleOnChange}
                  required
                >
                  <option value="" disabled selected>
                    Select-{" "}
                  </option>
                  {dateformateList &&
                    dateformateList.map((item) => {
                      return (
                        <option
                          id={item.id}
                          key={item.key}
                          style={{ color: "#353e46" }}
                          value={item.value}
                        >
                          {item.text}
                        </option>
                      );
                    })}
                </select>
              </fieldset>
              <span className="location-text">
                {formData.timeZone
                  ? moment
                      .tz(formData.timeZone)
                      .format(
                        (formData.dateFormat
                          ? formData.dateFormat
                          : "DD-MM-yyyy") +
                          (formData.timeFormat
                            ? formData.timeFormat === "12 Hrs"
                              ? " hh:mm"
                              : " HH:mm"
                            : "")
                      )
                  : ""}
              </span>

              <div className="location-form-entry-bottom-div">
                <button id="next" onClick={handleNext}>
                  {submitValue}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
};
