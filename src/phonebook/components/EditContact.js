import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import G_plus from "../../assets/images/g_plus.png";

const EditContact = ({
  rightContent,
  selectData,
  setData,
  setRightContent,
  setToken,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [submitValue, setSubmitValue] = useState("Update");
  const [additionalContact, setAdditionalContact] = useState();
  const defaultPin = "971";
  const regex =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  const [formContactData, setformContactData] = useState({});
  const handleFormContactChange = (event) => {
    const { name, value } = event.target;
    setformContactData({
      ...formContactData,
      [name]: value,
    });
  };

  const formValidation = (values) => {
    console.log("Form validation starts");
    if (!values.companyName) {
      setformContactData({
        ...formContactData,
        error: "Please fill company name",
      });
      return;
    }
    if (!values.contactPerson) {
      setformContactData({
        ...formContactData,
        error: "Please fill contact person",
      });
      return;
    }
    if (values.email && regex.test(formContactData.email) === false) {
      setformContactData({
        ...formContactData,
        error: "Please fill a valid email id",
      });
      return;
    }

    if (!values.contactNumber && !additionalContact) {
      setformContactData({
        ...formContactData,
        error: "Please fill contact number",
      });
      return;
    }

    if (
      (!values.contactNumber || values.contactNumber === defaultPin) &&
      !additionalContact
    ) {
      setformContactData({
        ...formContactData,
        error: "Please Enter contact number",
      });
      return;
    }

    if (
      values.contactNumber &&
      values.contactNumber !== defaultPin &&
      !validatePhone(values.contactNumber)
    ) {
      setformContactData({
        ...formContactData,
        error: "Invalid contact number",
      });
      return;
    }

    setformContactData({ ...formContactData, error: undefined });
    setSubmitValue("Saving...");
  };

  const handleContactFormSubmit = (event) => {
    event.preventDefault();
    formValidation(formContactData);
  };

  const validatePhone = (number) => {
    const phoneReg =
      /(\+|00)(297|93|244|1264|358|355|376|971|54|374|1684|1268|61|43|994|257|32|229|226|880|359|973|1242|387|590|375|501|1441|591|55|1246|673|975|267|236|1|61|41|56|86|225|237|243|242|682|57|269|238|506|53|5999|61|1345|357|420|49|253|1767|45|1809|1829|1849|213|593|20|291|212|34|372|251|358|679|500|33|298|691|241|44|995|44|233|350|224|590|220|245|240|30|1473|299|502|594|1671|592|852|504|385|509|36|62|44|91|246|353|98|964|354|972|39|1876|44|962|81|76|77|254|996|855|686|1869|82|383|965|856|961|231|218|1758|423|94|266|370|352|371|853|590|212|377|373|261|960|52|692|389|223|356|95|382|976|1670|258|222|1664|596|230|265|60|262|264|687|227|672|234|505|683|31|47|977|674|64|968|92|507|64|51|63|680|675|48|1787|1939|850|351|595|970|689|974|262|40|7|250|966|249|221|65|500|4779|677|232|503|378|252|508|381|211|239|597|421|386|46|268|1721|248|963|1649|235|228|66|992|690|993|670|676|1868|216|90|688|886|255|256|380|598|1|998|3906698|379|1784|58|1284|1340|84|678|681|685|967|27|260|263)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{4,20}$/;
    return phoneReg.test("+" + number);
  };

  useEffect(async () => {
    if (submitValue === "Saving..." && !formContactData.error) {
      formContactData.contactNumber =
        (formContactData.contactNumber &&
        formContactData.contactNumber !== defaultPin
          ? formContactData.contactNumber
          : "") + (additionalContact ? "," + additionalContact : "");
      formContactData["assignee"] = currentUser.username;
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/phoneBook/update-phone-book?timeZone=" +
            currentUser.timeZone,
          formContactData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }

          setData((prev) => {
            let updatedPhoneBook = prev.filter((p) => {
              if (p.ID === selectData.ID) {
                p.companyName = formContactData.companyName;
                p.companyNameAlias = formContactData.companyNameAlias;
                p.contactPerson = formContactData.contactPerson;
                p.contactNumber = formContactData.contactNumber;
                p.keyWords = formContactData.keyWords;
                p.rating = formContactData.rating;
                p.category = formContactData.category;
                p.email = formContactData.email;
                p.error = undefined;
                p.address = formContactData.address;
                p.history.unshift({
                  moduleID: formContactData.ID,
                  action: "Edited",
                  dateAndTime: new Date(
                    new Date().toLocaleString("en-US", {
                      timeZone: currentUser.timeZone,
                    })
                  ).toLocaleString(),
                  name: currentUser.username,
                });
              }
              return p;
            });
            return updatedPhoneBook;
          });
          setSubmitValue("Update");
          setRightContent("Details");
          toast.success("Contact Updated Successfully");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Contact updation failed");
          setSubmitValue("Update");
        });
    }
  }, [submitValue]);

  useEffect(() => {
    if (rightContent != "Edit" || selectData == undefined) return;
    if (selectData.contactNumber.split(",").length > 1) {
      setAdditionalContact(selectData.contactNumber.split(",")[0]);
    }
    setformContactData({
      companyName: selectData.companyName,
      companyNameAlias: selectData.companyNameAlias,
      contactPerson: selectData.contactPerson,
      contactNumber:
        selectData.contactNumber.split(",").length > 1
          ? selectData.contactNumber.split(",")[1]
          : selectData.contactNumber,
      keyWords: selectData.keyWords,
      rating: selectData.rating,
      category: selectData.category,
      email: selectData.email,
      error: undefined,
      address: selectData.address,
      ID: selectData.ID,
    });
  }, [rightContent]);

  return (
    rightContent === "Edit" && (
      <div className="task-details-box">
        <div className="create-task-container task-details-container">
          <form name="taskForm" autoComplete="off">
            <div className="task-form-container">
              {formContactData.error ? (
                <div>
                  <span class="warning-text-error warning-text">
                    {formContactData.error}
                  </span>
                </div>
              ) : (
                ""
              )}
              <fieldset>
                <legend>Company Name</legend>
                <input
                  type="text"
                  name="companyName"
                  value={formContactData.companyName}
                  onChange={handleFormContactChange}
                  placeholder="Enter Company Name"
                  maxLength="75"
                />
              </fieldset>
              <fieldset>
                <legend>Contact Person</legend>
                <input
                  type="text"
                  name="contactPerson"
                  value={formContactData.contactPerson}
                  onChange={handleFormContactChange}
                  placeholder="Enter Contact Person Name"
                  maxLength="75"
                />
              </fieldset>
              <fieldset>
                <legend>Email</legend>
                <input
                  type="email"
                  name="email"
                  value={formContactData.email}
                  onChange={handleFormContactChange}
                  placeholder="Email address (Optional)"
                  maxLength="75"
                />
              </fieldset>
              {additionalContact && (
                <>
                  <span className="additional-text">
                    +{additionalContact}
                    <small
                      title="Remove Contact"
                      style={{
                        paddingLeft: "5px",
                        fontSize: "0.88vw",
                        color: "#0b375b",
                      }}
                      onClick={() => {
                        setAdditionalContact();
                      }}
                    >
                      &#10006;
                    </small>
                  </span>
                  <p></p>
                </>
              )}
              <div style={{ width: "100%", display: "flex" }}>
                <div style={{ width: additionalContact ? "100%" : "86%" }}>
                  <fieldset>
                    <legend>Contact Number</legend>
                    <PhoneInput
                      name="contactNumber"
                      value={formContactData.contactNumber}
                      placeholder="Enter Contact Number"
                      onChange={(p) =>
                        setformContactData({
                          ...formContactData,
                          contactNumber: p,
                          error: undefined,
                        })
                      }
                    />
                  </fieldset>
                </div>
                {!additionalContact && (
                  <div style={{ width: "14%", position: "relative" }}>
                    <img
                      className="phonebook-contact-add"
                      src={G_plus}
                      onClick={() => {
                        if (validatePhone(formContactData.contactNumber)) {
                          setAdditionalContact(formContactData.contactNumber);
                          setformContactData({
                            ...formContactData,
                            contactNumber: defaultPin,
                          });
                        } else {
                          setformContactData({
                            ...formContactData,
                            error: "Invalid Phone Number",
                          });
                        }
                      }}
                    />
                  </div>
                )}
              </div>
              <fieldset>
                <legend>Address</legend>
                <input
                  type="text"
                  name="address"
                  value={formContactData.address}
                  onChange={handleFormContactChange}
                  placeholder="(Optional) - 300 Characters MAX"
                  maxLength="300"
                />
              </fieldset>
              <fieldset>
                <legend>Key Words/ Type of work</legend>
                <input
                  type="text"
                  name="keyWords"
                  value={formContactData.keyWords}
                  onChange={handleFormContactChange}
                  placeholder="(Optional) - 300 Characters MAX"
                  maxLength="300"
                />
              </fieldset>
              <div className="submit-button-container">
                <input
                  className="submit-button"
                  type="button"
                  value={submitValue}
                  // disabled=
                  onClick={handleContactFormSubmit}
                />
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
};

export default EditContact;
