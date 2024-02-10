import { faPercent } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import React, { useState, useEffect } from "react";
import DatePicker from "react-date-picker";
import toast from "react-hot-toast";
import "./financial.css";
import CurrencyList from "currency-list";

const Financial = ({
  setNext,
  setToken,
  actionName,
  setactionName,
  loading,
  settingScroll,
}) => {
  let emptyFinance = {
    taxNo: "",
    authority: "",
    taxLabal: "",
    currType: "",
    currPos: "",
    finYrDate: undefined,
    saleTax: "",
    saleTaxPer: "",
    purTax: "",
    purTaxPer: "",
    taxPeriod: "",
  };
  const [formData, setformData] = useState(emptyFinance);
  const [submitValue, setSubmitValue] = useState("Next");
  const [error, setError] = useState(false);
  const [taxLabalList, settaxLabalList] = useState([
    {
      id: 1,
      value: "TAX",
    },
    {
      id: 2,
      value: "VAT",
    },
    {
      id: 3,
      value: "GST",
    },
  ]);
  const [currTypeList, setcurrTypeList] = useState(
    CurrencyList.getAll("en_US")
  );
  const [taxPeriod, settaxPeriod] = useState([
    "Monthly",
    "2 monthly",
    "3 monthly",
    "6 monthly",
    "Annually",
  ]);

  useEffect(async () => {
    let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
    if (actionName !== "Financial") return;
    if (formData.id) return;
    if (currentUser && currentUser.orgID === 0) {
      setformData(emptyFinance);
      alert("Please Update Organization");
      setactionName("Organization");
      return;
    } else {
      loading({ visibility: true, message: "Loading Financial..." });
      settingScroll.current.scrollTop = 0;
      await axios
        .get(
          process.env.REACT_APP_API_ENDPOINT +
            "/settings/getFinancial?ID=" +
            currentUser.orgID,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }

          if (res.data.length > 0) {
            res.data[0].finYrDate = new Date(res.data[0].finYrDate);
            setformData(res.data[0]);
          } else {
            setformData(emptyFinance);
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
    if (formData.id) {
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
    if (submitValue === "Next") {
      setNext();
      return;
    }
    if (formValidation()) {
      setError("Please fill out all the mandatory fields");
      settingScroll.current.scrollTop = 0;
      return;
    } else {
      setError(undefined);
      if (submitValue === "Update") {
        setSubmitValue("...Updating");
        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT + "/settings/updateFinancial",
            formData,
            {
              headers: {
                Authorization: window.localStorage.getItem("token"),
              },
            }
          )
          .then((res) => {
            if (res.data.error) {
              setToken(undefined);
            }
            toast.success("Financial data updated Sucessfully");
            setSubmitValue("Next");
          })
          .catch((err) => {
            console.log(error);
            toast.error("Financial updation Failed");
            setSubmitValue("Next");
          });
      } else {
        setSubmitValue("...Saving");
        await axios
          .post(
            process.env.REACT_APP_API_ENDPOINT +
              "/settings/createFinancial?orgID=" +
              currentUser.orgID,
            formData,
            {
              headers: {
                Authorization: window.localStorage.getItem("token"),
              },
            }
          )
          .then((res) => {
            if (res.data.error) {
              setToken(undefined);
            }

            setformData((prev) => ({ ...prev, id: res.data.id }));
            toast.success("Financial data saved Sucessfully");
            setSubmitValue("Next");
          })
          .catch((err) => {
            console.log(error);
            toast.error("Financial creation Failed");
            setSubmitValue("Next");
          });
      }
    }
  };

  return (
    actionName === "Financial" && (
      <div id="financial">
        <div className="financial-main-container create-task-container">
          <form
            id="financial-entryForm"
            name="financial"
            noValidate
            autoComplete="off"
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
            <div className="financial-left-div">
              <fieldset>
                <legend>Tax Registration number </legend>
                <input
                  type="text"
                  id="taxNo"
                  name="taxNo"
                  value={formData.taxNo}
                  onChange={handleOnChange}
                  placeholder="Enter TX Tegistration Number"
                />
              </fieldset>
              <fieldset>
                <legend>Tax Authority Name </legend>
                <input
                  type="text"
                  id="authority"
                  name="authority"
                  value={formData.authority}
                  onChange={handleOnChange}
                  placeholder="Enter Authority "
                />
              </fieldset>
              <fieldset>
                <legend>Tax Label </legend>
                <select
                  className="title"
                  id="taxLabal"
                  name="taxLabal"
                  value={formData.taxLabal}
                  onChange={handleOnChange}
                  required
                >
                  <option value="" disabled selected>
                    Select - TAX/VAT/GST
                  </option>
                  {taxLabalList &&
                    taxLabalList.map((item) => {
                      return (
                        <option style={{ color: "#353e46" }} value={item.value}>
                          {item.value}
                        </option>
                      );
                    })}
                </select>
              </fieldset>
              <fieldset>
                <legend>Currency Type</legend>
                <select
                  className="title"
                  id="currType"
                  name="currType"
                  value={formData.currType}
                  onChange={handleOnChange}
                  required
                >
                  <option value="" disabled selected>
                    Select Currency{" "}
                  </option>
                  {currTypeList &&
                    Object.keys(currTypeList).map((key) => {
                      return (
                        <option
                          style={{ color: "#353e46" }}
                          value={currTypeList[key].code}
                        >{`${currTypeList[key].name_plural} - ${currTypeList[key].code}`}</option>
                      );
                    })}
                </select>
              </fieldset>
              <fieldset>
                <legend>Currency Position</legend>
                <select
                  className="title"
                  id="currPos"
                  name="currPos"
                  value={formData.currPos}
                  onChange={handleOnChange}
                  required
                >
                  <option value="" disabled selected>
                    Select - Before / After
                  </option>
                  <option value="Before">Before</option>
                  <option value="After">After</option>
                </select>
              </fieldset>
              <fieldset>
                <legend>Financial Year End</legend>
                <DatePicker
                  dayPlaceholder="DD"
                  monthPlaceholder="MM"
                  yearPlaceholder="YYYY"
                  value={formData.finYrDate}
                  selected={formData.finYrDate}
                  onChange={(date) => {
                    setformData({ ...formData, finYrDate: date });
                    handleOnChange();
                  }}
                  required={true}
                  calendarIcon={null}
                  clearIcon={null}
                />
              </fieldset>
              <div className="taxLabel">Tax Defaults</div>
              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "42%" }}>
                  <fieldset>
                    <legend>For Sales </legend>
                    <select
                      className="title"
                      id="saleTax"
                      name="saleTax"
                      value={formData.saleTax}
                      onChange={handleOnChange}
                      required
                    >
                      <option value="" disabled selected>
                        Select Sale Tax Type
                      </option>
                      <option value="Tax Exclusive"> Tax Exclusive </option>
                      <option value="Tax inclusive">Tax inclusive</option>
                      <option value="NO TAX">NO TAX</option>
                    </select>
                  </fieldset>
                </div>
                <div
                  style={{
                    width: "42%",
                    left: "4%",
                    position: "relative",
                    display: "flex",
                    paddingRight: "5px",
                  }}
                >
                  <fieldset>
                    <legend>Tax Percentage</legend>
                    <input
                      style={{ width: "90%" }}
                      type="text"
                      id="saleTaxPer"
                      name="saleTaxPer"
                      value={formData.saleTaxPer}
                      onChange={handleOnChange}
                      placeholder="5"
                    />
                    <FontAwesomeIcon icon={faPercent} size="xs" />
                  </fieldset>
                </div>
              </div>
              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "42%" }}>
                  <fieldset>
                    <legend>For Purchase</legend>
                    <select
                      className="title"
                      id="purTax"
                      name="purTax"
                      value={formData.purTax}
                      onChange={handleOnChange}
                      required
                    >
                      <option value="" disabled selected>
                        Select Purchase Tax Type
                      </option>
                      <option value="Tax Exclusive"> Tax Exclusive </option>
                      <option value="Tax inclusive">Tax inclusive</option>
                      <option value="NO TAX">NO TAX</option>
                    </select>
                  </fieldset>
                </div>
                <div
                  style={{
                    width: "42%",
                    left: "4%",
                    position: "relative",
                    display: "flex",
                    paddingRight: "5px",
                  }}
                >
                  <fieldset>
                    <legend>Tax Percentage</legend>
                    <input
                      style={{ width: "90%" }}
                      type="text"
                      id="purTaxPer"
                      name="purTaxPer"
                      value={formData.purTaxPer}
                      onChange={handleOnChange}
                      placeholder="5"
                    ></input>
                    <FontAwesomeIcon icon={faPercent} size="xs" />
                  </fieldset>
                </div>
              </div>
              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: "42%" }}>
                  <fieldset>
                    <legend>Tax Period </legend>
                    <select
                      className="title"
                      id="taxPeriod"
                      name="taxPeriod"
                      value={formData.taxPeriod}
                      onChange={handleOnChange}
                      required
                    >
                      <option value="" disabled selected>
                        Select Tax Period
                      </option>
                      {taxPeriod &&
                        taxPeriod.map((item) => {
                          return <option value={item}>{item}</option>;
                        })}
                    </select>
                  </fieldset>
                </div>
              </div>
              <div className="financial-form-left-bottom-div">
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
export default Financial;
