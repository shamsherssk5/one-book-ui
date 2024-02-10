import React, { useEffect, useRef, useState } from "react";
import Gap from "../../common/Gap";
import Edit_Button from "../../tasks/assets/edit-but.png";
import Delete_Button from "../../tasks/assets/delete-but.png";
import Dep_plus from "../../tasks/assets/dep-plus.png";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import axios from "axios";
import Back_Button from "../../assets/images/back-button.png";
import PhoneInput from "react-phone-input-2";
import toast from "react-hot-toast";
import History from "../../common/History";
import { Country } from "country-state-city";
import { getConfirmation } from "../../common/DialogBox";

const CustomerDetails = ({
  rightContent,
  currentCustomer,
  setToken,
  setData,
  contacts,
  setContacts,
}) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  const ref = useRef(null);
  let emptyContact = {
    name: "",
    profession: "",
    phone: "971",
    email: "",
    custID: "",
  };

  const [contactCount, setContactCount] = useState(10);
  const [formData, setFormdata] = useState(emptyContact);
  const [SubmitButton, setSubmitButton] = useState("Save");
  const [error, setError] = useState(undefined);

  useEffect(async () => {
    if (!currentCustomer) return;
    setCreateContactView(false);
    if (currentCustomer.attachments && currentCustomer.attachments.length > 0)
      return;
    if (rightContent !== "Company Info") return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/files/attachments?ID=customer" +
          currentCustomer.custID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.custID === currentCustomer.custID) {
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
  }, [currentCustomer]);

  useEffect(async () => {
    if (!currentCustomer) return;
    if (currentCustomer.history && currentCustomer.history.length > 0) return;
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/common/history?ID=customer" +
          currentCustomer.custID,
        { headers: { Authorization: window.localStorage.getItem("token") } }
      )
      .then((res) => {
        if (res.data.error) {
          setToken(undefined);
        }
        setData((prev) => {
          let updatedData = prev.filter((cust) => {
            if (cust.custID === currentCustomer.custID) {
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
  }, [currentCustomer]);

  const [createContactView, setCreateContactView] = useState(false);
  const handleDelete = (id) => {
    setData((prev) => {
      let updatedData = prev.filter((cust) => {
        if (cust.custID === currentCustomer.custID) {
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
        if (cust.custID === currentCustomer.custID) {
          cust.attachments.push(file);
        }
        return cust;
      });
      return updatedData;
    });
  };

  const handleFormChange = (e) => {
    setError(undefined);
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (d) => {
    setFormdata(d);
    setSubmitButton("Update");
    setCreateContactView(true);
  };
  const handleDeleteContact = async (contact) => {
    await getConfirmation("You want to delete Contact?", () => {
      axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/customers/delete-contact",
          { id: contact.id },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setContacts((prev) => {
            let updCon = prev.filter((p) => p.id !== contact.id);
            return updCon;
          });
          setFormdata(emptyContact);
          toast.success("Contact deleted successfully");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Contact Deletion Failed..!");
        });
    });
  };

  const handleContactSave = () => {
    if (!formData.name) {
      setError("Please Enter Name");
      return;
    } else if (formData.email && emailValidation(formData.email)) {
      setError("Please Enter Valid Email!");
      return;
    } else if (!formData.phone || formData.phone === emptyContact.phone) {
      setError("Please Enter Phone Number!");
      return;
    } else if (!validatePhone(formData.phone)) {
      setError("Invalid Phone Number!");
      return;
    }
    if (SubmitButton === "Save") setSubmitButton("...Saving");
    else if (SubmitButton === "Update") setSubmitButton("...Updating");
  };

  const validatePhone = (number) => {
    const phoneReg =
      /(\+|00)(297|93|244|1264|358|355|376|971|54|374|1684|1268|61|43|994|257|32|229|226|880|359|973|1242|387|590|375|501|1441|591|55|1246|673|975|267|236|1|61|41|56|86|225|237|243|242|682|57|269|238|506|53|5999|61|1345|357|420|49|253|1767|45|1809|1829|1849|213|593|20|291|212|34|372|251|358|679|500|33|298|691|241|44|995|44|233|350|224|590|220|245|240|30|1473|299|502|594|1671|592|852|504|385|509|36|62|44|91|246|353|98|964|354|972|39|1876|44|962|81|76|77|254|996|855|686|1869|82|383|965|856|961|231|218|1758|423|94|266|370|352|371|853|590|212|377|373|261|960|52|692|389|223|356|95|382|976|1670|258|222|1664|596|230|265|60|262|264|687|227|672|234|505|683|31|47|977|674|64|968|92|507|64|51|63|680|675|48|1787|1939|850|351|595|970|689|974|262|40|7|250|966|249|221|65|500|4779|677|232|503|378|252|508|381|211|239|597|421|386|46|268|1721|248|963|1649|235|228|66|992|690|993|670|676|1868|216|90|688|886|255|256|380|598|1|998|3906698|379|1784|58|1284|1340|84|678|681|685|967|27|260|263)(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{4,20}$/;
    return phoneReg.test("+" + number);
  };

  const emailValidation = (value) => {
    let mailformat =
      /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
    return !value.match(mailformat);
  };

  useEffect(async () => {
    if (SubmitButton === "...Saving") {
      setError(undefined);
      formData.custID = currentCustomer ? currentCustomer.custID : 0;
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/customers/create-contact",
          formData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          formData["id"] = res.data.insertId;
          toast.success("Contact created successfully");
          setContacts([...contacts, formData]);
          setSubmitButton("Save");
          setFormdata(emptyContact);
          setCreateContactView(false);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Contact creation failed");
          setSubmitButton("Save");
        });
    } else if (SubmitButton === "...Updating") {
      setError(undefined);
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/customers/update-contact",
          formData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          toast.success("Contact Updated successfully");
          setContacts((prev) => {
            let updContacts = prev.filter((c) => {
              if (formData.id === c.id) {
                c.name = formData.name;
                c.profession = formData.profession;
                c.email = formData.email;
                c.phone = formData.phone;
              }
              return c;
            });
            return updContacts;
          });
          setSubmitButton("Save");
          setCreateContactView(false);
          setFormdata(emptyContact);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Contact updation failed");
          setSubmitButton("Update");
        });
    }
  }, [SubmitButton]);

  const handleSeeMore = () => {
    if (contactCount >= contacts.length) {
      setContactCount(10);
    } else {
      setContactCount((c) => c + 10);
    }
  };
  return (
    rightContent === "Company Info" &&
    currentCustomer && (
      <div className="task-details-box" ref={ref}>
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
                    <td className="blue-heading" colSpan="2">
                      Business Type
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      {currentCustomer.businessType}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr className="table-heading">
                    <td className="blue-heading" colSpan="2">
                      Address
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      {currentCustomer.address}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr className="table-heading">
                    <td className="blue-heading" colSpan="2">
                      Country
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      {
                        (
                          Country.getCountryByCode(currentCustomer.country) ||
                          {}
                        ).name
                      }
                    </td>
                  </tr>
                  <tr></tr>
                  <tr className="table-heading">
                    <td className="blue-heading" colSpan="2">
                      Email
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      {currentCustomer.emailAccounts}
                    </td>
                  </tr>
                  <tr></tr>
                  <tr className="table-heading">
                    <td className="blue-heading" colSpan="2">
                      Tel Number
                    </td>
                  </tr>
                  <tr>
                    <td className="table-heading" colSpan="2">
                      +{currentCustomer.phone}
                    </td>
                  </tr>
                  <tr></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Gap></Gap>
        {!createContactView ? (
          <>
            <div className="messages task-details-container">
              <div className="message-Heading">
                Contacts
                <img
                  src={Dep_plus}
                  className="contact-plus"
                  onClick={() => {
                    setCreateContactView(true);
                    setSubmitButton("Save");
                  }}
                />
              </div>
            </div>
            <div
              className="customer-contact-holder"
              style={{ marginTop: "5vh" }}
            >
              <div className="task-details-container">
                <div
                  className="dep-table"
                  style={{ paddingTop: "0!important" }}
                >
                  <table
                    className="equalDivide"
                    cellPadding="0"
                    cellSpacing="0"
                    width="100%"
                    border="0"
                  >
                    <tbody>
                      {contacts
                        ? contacts
                            .filter((d, i) => i < contactCount)
                            .map((d, index) => (
                              <tr className="dep-tr" key={index}>
                                <td className="name-container">{d.name}</td>
                                <td className="dep-small-td">
                                  <img
                                    title="Edit"
                                    className="dep-img"
                                    onClick={() => handleEdit(d)}
                                    src={Edit_Button}
                                  />
                                </td>
                                <td className="dep-small-td">
                                  <img
                                    className="dep-img"
                                    title="Delete"
                                    src={Delete_Button}
                                    onClick={() => handleDeleteContact(d)}
                                  />
                                </td>
                              </tr>
                            ))
                        : ""}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            {contacts && contacts.length > 10 && (
              <span className="contact-view-more" onClick={handleSeeMore}>
                {contactCount > contacts.length ? "View Less" : "View More"}
              </span>
            )}
          </>
        ) : (
          <>
            <div className="messages task-details-container">
              <div className="message-Heading">
                <img
                  className="contact-back"
                  src={Back_Button}
                  onClick={() => {
                    setCreateContactView(false);
                    setFormdata(emptyContact);
                  }}
                />
                Create Contact
              </div>
            </div>
            <div className="create-task-container task-details-container">
              <form name="taskForm" autoComplete="off">
                <div className="task-form-container">
                  {error ? (
                    <div>
                      <span class="warning-text-error warning-text">
                        {error}
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                  <fieldset>
                    <legend>Contact Name</legend>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder="Enter New Contact Name"
                    />
                  </fieldset>
                  <fieldset>
                    <legend>Profession</legend>
                    <input
                      type="text"
                      name="profession"
                      value={formData.profession}
                      onChange={handleFormChange}
                      placeholder="Enter Profession (Optional)"
                    />
                  </fieldset>
                  <fieldset>
                    <legend>Phone Number</legend>
                    <PhoneInput
                      country={"ae"}
                      value={formData.phone}
                      placeholder="Enter Company Phone Number"
                      onChange={(p) => {
                        setFormdata({ ...formData, phone: p });
                        setError();
                      }}
                    />
                  </fieldset>

                  <fieldset>
                    <legend>Email</legend>
                    <input
                      type="text"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="Enter Profession (Optional)"
                    />
                  </fieldset>
                </div>
              </form>
            </div>
            <div className="create-task-container task-details-container">
              <div className="submit-button-container">
                <input
                  className="submit-button"
                  type="button"
                  value={SubmitButton}
                  onClick={handleContactSave}
                />
              </div>
            </div>
          </>
        )}
        <Gap></Gap>
        {currentCustomer && currentCustomer.attachments && (
          <FileUploaderListViewer
            isView={true}
            setToken={setToken}
            data={currentCustomer.attachments}
            handleUpload={handleUpload}
            handleDelete={handleDelete}
            module="customer"
            id={"customer" + currentCustomer.custID}
          />
        )}
        <Gap />
        {currentCustomer && currentCustomer.history && (
          <History data={currentCustomer.history} />
        )}
      </div>
    )
  );
};

export default CustomerDetails;
