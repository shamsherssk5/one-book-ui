import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import G_plus from "../../assets/images/g_plus.png";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import Gap from "../../common/Gap";

const CreateContact = ({
  rightContent,
  setRightContent,
  setSelectData,
  setData,
  setToken,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const [files, setFiles] = useState([]);
  const [additionalContact, setAdditionalContact] = useState();
  const ref = useRef(null);
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
  const [submitValue, setSubmitValue] = useState("Save");
  const regex =
    /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

  let emptyContact = {
    companyName: "",
    contactPerson: "",
    contactNumber: "971",
    keyWords: "",
    rating: 3,
    category: "preferred",
    email: "",
    error: undefined,
    orgID: currentUser.orgID,
    address: "",
    assignee: currentUser.username,
  };
  const [formContactData, setformContactData] = useState(emptyContact);

  const handleFormContactChange = (event) => {
    const { name, value } = event.target;
    setformContactData({
      ...formContactData,
      [name]: value,
      error: undefined,
    });
    validatePhone(formContactData.contactNumber);
  };

  const formValidation = (values) => {
    console.log("Form validation starts");
    if (!values.companyName) {
      ref.current.scrollTop = 0;
      setformContactData({
        ...formContactData,
        error: "Please Enter company name",
      });
      return;
    }
    if (!values.contactPerson) {
      ref.current.scrollTop = 0;
      setformContactData({
        ...formContactData,
        error: "Please Enter contact person",
      });
      return;
    }
    if (values.email && regex.test(formContactData.email) === false) {
      ref.current.scrollTop = 0;
      setformContactData({
        ...formContactData,
        error: "Please Enter a valid email id",
      });
      return;
    }
    if (
      (!values.contactNumber ||
        values.contactNumber === emptyContact.contactNumber) &&
      !additionalContact
    ) {
      ref.current.scrollTop = 0;
      setformContactData({
        ...formContactData,
        error: "Please Enter contact number",
      });
      return;
    }

    if (
      values.contactNumber &&
      values.contactNumber !== emptyContact.contactNumber &&
      !validatePhone(values.contactNumber)
    ) {
      ref.current.scrollTop = 0;
      setformContactData({
        ...formContactData,
        error: "Invalid contact number",
      });
      return;
    }
    setformContactData({ ...formContactData, error: undefined });
    setSubmitValue("...Saving");
  };

  const validatePhone = (number) => {
    const phoneReg =
      /(\+|00)(297|93|244|1264|358|355|376|971|54|374|1684|1268|61|43|994|257|32|229|226|880|359|973|1242|387|590|375|501|1441|591|55|1246|673|975|267|236|1|61|41|56|86|225|237|243|242|682|57|269|238|506|53|5999|61|1345|357|420|49|253|1767|45|1809|1829|1849|213|593|20|291|212|34|372|251|358|679|500|33|298|691|241|44|995|44|233|350|224|590|220|245|240|30|1473|299|502|594|1671|592|852|504|385|509|36|62|44|91|246|353|98|964|354|972|39|1876|44|962|81|76|77|254|996|855|686|1869|82|383|965|856|961|231|218|1758|423|94|266|370|352|371|853|590|212|377|373|261|960|52|692|389|223|356|95|382|976|1670|258|222|1664|596|230|265|60|262|264|687|227|672|234|505|683|31|47|977|674|64|968|92|507|64|51|63|680|675|48|1787|1939|850|351|595|970|689|974|262|40|7|250|966|249|221|65|500|4779|677|232|503|378|252|508|381|211|239|597|421|386|46|268|1721|248|963|1649|235|228|66|992|690|993|670|676|1868|216|90|688|886|255|256|380|598|1|998|3906698|379|1784|58|1284|1340|84|678|681|685|967|27|260|263)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{4,20}$/;
    return phoneReg.test("+" + number);
  };

  const handleContactFormSubmit = (event) => {
    event.preventDefault();
    formValidation(formContactData);
  };

  useEffect(async () => {
    if (submitValue === "...Saving" && !formContactData.error) {
      formContactData["attachments"] = files;
      formContactData.contactNumber =
        (formContactData.contactNumber &&
        formContactData.contactNumber !== emptyContact.contactNumber
          ? formContactData.contactNumber
          : "") + (additionalContact ? "," + additionalContact : "");
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/phoneBook/create-phone-book?timeZone=" +
            currentUser.timeZone,
          formContactData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          formContactData["ID"] = res.data.insertId;
          formContactData["refText"] = "CON-";
          formContactData["refNum"] = "####";
          formContactData["history"] = [];
          formContactData["conversations"] = [];
          formContactData["creationTime"] = new Date(
            new Date().toLocaleString("en-US", {
              timeZone: currentUser.timeZone,
            })
          ).toLocaleString();
          formContactData.history.unshift({
            moduleID: formContactData.iD,
            action: "Added",
            dateAndTime: new Date(
              new Date().toLocaleString("en-US", {
                timeZone: currentUser.timeZone,
              })
            ).toLocaleString(),
            name: formContactData.assignee,
          });
          setData((prevState) => [formContactData, ...prevState]);
          setSelectData(formContactData);
          setSubmitValue("Save");
          setAdditionalContact();
          setFiles([]);
          setRightContent("Details");
          setformContactData(emptyContact);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Contact creation failed");
          setSubmitValue("Save");
        });
    }
  }, [submitValue]);

  return (
    rightContent === "Create" && (
      <div className="task-details-box" ref={ref}>
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
                      onChange={(p, country) => {
                        setformContactData({
                          ...formContactData,
                          contactNumber: p,
                          error: undefined,
                        });
                      }}
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
                            contactNumber: emptyContact.contactNumber,
                          });
                        } else {
                          setformContactData({
                            ...formContactData,
                            error: "Invalid Phone Number",
                          });
                          ref.current.scrollTop = 0;
                        }
                      }}
                    />
                  </div>
                )}
              </div>

              <fieldset>
                <legend>Address</legend>
                <textarea
                  id="notes"
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
                  onClick={handleContactFormSubmit}
                />
              </div>
            </div>
          </form>
        </div>
        <Gap />
        <FileUploaderListViewer
          isView={false}
          setToken={setToken}
          data={files}
          handleUpload={handleUpload}
          handleDelete={handleDelete}
          module="phonebook"
          id={undefined}
        />
      </div>
    )
  );
};

export default CreateContact;
