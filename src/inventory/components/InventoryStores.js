import React, { useEffect, useState } from "react";
import Edit_Button from "../../tasks/assets/edit-but.png";
import Delete_Button from "../../tasks/assets/delete-but.png";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import toast from "react-hot-toast";
import { getConfirmation } from "../../common/DialogBox";
import Dep_plus from "../../tasks/assets/dep-plus.png";
import Open from "../../assets/images/next.png";

const InventoryStores = ({ rightContent, stores, setstores, setToken }) => {
  let currentUser = JSON.parse(window.localStorage.getItem("currentUser"));
  let emptyStore = {
    warehouseName: "",
    area: "",
    address: "",
    contactName: "",
    phone: "971",
    orgID: currentUser.orgID,
  };

  const [addVisible, setAddVisible] = useState(false);
  const [openContact, setopenContact] = useState(false);
  const [formData, setFormdata] = useState(emptyStore);
  const [SubmitButton, setSubmitButton] = useState("Save");
  const [error, setError] = useState(undefined);
  const [storeCount, setstoreCount] = useState(10);
  useEffect(async () => {
    if (stores && stores.length > 0) return;
    if (rightContent) {
      await axios
        .get(
          process.env.REACT_APP_API_ENDPOINT +
            "/inventory/stores?orgID=" +
            currentUser.orgID,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setstores(res.data);
        })
        .catch((err) => {
          console.log(err);
        });
    }
    setAddVisible(false);
  }, [rightContent]);

  const handleFormChange = (e) => {
    setError(undefined);
    setFormdata({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (d) => {
    setFormdata(d);
    setSubmitButton("Update");
    setAddVisible(true);
  };
  const handleDelete = async (store) => {
    await getConfirmation("You want to delete Store?", () => {
      axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/inventory/delete-store",
          { id: store.id },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          setstores((prev) => {
            let updCon = prev.filter((p) => p.id !== store.id);
            return updCon;
          });
          setFormdata(emptyStore);
          toast.success("Store deleted successfully");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Store Deletion Failed..!");
        });
    });
  };

  const handlestoresave = () => {
    if (!formData.warehouseName) {
      setError("Please Enter Ware House Name");
      return;
    } else if (!formData.area) {
      setError("Please Enter Area");
      return;
    } else if (!formData.address) {
      setError("Please Enter Address");
      return;
    } else if (
      formData.phone !== emptyStore.phone &&
      !validatePhone(formData.phone)
    ) {
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

  const handleSeeMore = () => {
    if (storeCount >= stores.length) {
      setstoreCount(10);
    } else {
      setstoreCount((c) => c + 10);
    }
  };
  useEffect(async () => {
    if (SubmitButton === "...Saving") {
      setError(undefined);
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/inventory/create-store",
          formData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          formData["id"] = res.data.insertId;
          toast.success("Store created successfully");
          setstores([...stores, formData]);
          setSubmitButton("Save");
          setFormdata(emptyStore);
          setAddVisible(false);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Store creation failed");
          setSubmitButton("Save");
          setAddVisible(true);
        });
    } else if (SubmitButton === "...Updating") {
      setError(undefined);
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT + "/inventory/update-store",
          formData,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          toast.success("Store Updated successfully");
          setstores((prev) => {
            let updstores = prev.filter((c) => {
              if (formData.id === c.id) {
                c.warehouseName = formData.warehouseName;
                c.area = formData.area;
                c.address = formData.address;
                c.contactName = formData.contactName;
                c.phone = formData.phone;
              }
              return c;
            });
            return updstores;
          });
          setSubmitButton("Save");
          setFormdata(emptyStore);
          setAddVisible(false);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Store updation failed");
          setSubmitButton("Update");
          setAddVisible(true);
        });
    }
  }, [SubmitButton]);

  return (
    rightContent === "Stores" && (
      <>
        <div className="task-details-box">
          <div className="create-task-container task-details-container warehouse-heading">
            <div className="department-heading">
              <span>Warehouse</span>
              <img
                title="Add Department"
                className="dep-plus"
                src={Dep_plus}
                style={addVisible ? { transform: "rotate(45deg)" } : {}}
                onClick={() => {
                  setAddVisible(!addVisible);
                  setFormdata(emptyStore);
                }}
              />
            </div>
          </div>
          {addVisible && (
            <>
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
                      <legend>Warehouse Name</legend>
                      <input
                        type="text"
                        name="warehouseName"
                        value={formData.warehouseName}
                        onChange={handleFormChange}
                        placeholder="Enter Ware House Name"
                      />
                    </fieldset>
                    <fieldset>
                      <legend>Area</legend>
                      <input
                        type="text"
                        name="area"
                        value={formData.area}
                        onChange={handleFormChange}
                        placeholder="Enter Area"
                      />
                    </fieldset>

                    <fieldset>
                      <legend>address</legend>
                      <textarea
                        id="notes"
                        name="address"
                        value={formData.address}
                        onChange={handleFormChange}
                        placeholder="Enter Address. 200 Characters MAX"
                        maxLength="200"
                      />
                    </fieldset>
                  </div>
                  <div className="financial-details-Box">
                    <div className="financial-box-header">
                      Add Contact Person
                    </div>
                    <div className="finacial-box-image-container">
                      <img
                        style={
                          openContact ? { transform: "rotate(90deg)" } : {}
                        }
                        src={Open}
                        onClick={() => {
                          setopenContact(!openContact);
                        }}
                      />
                    </div>
                  </div>

                  {openContact && (
                    <div>
                      <fieldset>
                        <legend>Contact Name</legend>
                        <input
                          type="text"
                          name="contactName"
                          value={formData.contactName}
                          onChange={handleFormChange}
                          placeholder="Enter Contact Name"
                        />
                      </fieldset>
                      <fieldset>
                        <legend>Phone Number</legend>
                        <PhoneInput
                          value={formData.phone}
                          placeholder="Enter Phone Number"
                          onChange={(p) => {
                            setFormdata({ ...formData, phone: p });
                            setError();
                          }}
                        />
                      </fieldset>
                    </div>
                  )}
                </form>
              </div>
              <div className="create-task-container task-details-container">
                <div className="submit-button-container">
                  <input
                    className="submit-button"
                    type="button"
                    value={SubmitButton}
                    onClick={handlestoresave}
                  />
                </div>
              </div>
            </>
          )}
          {stores && stores.length > 0 && (
            <div className="customer-contact-holder inventory-stores-holder">
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
                      {stores
                        ? stores
                            .filter((d, i) => i < storeCount)
                            .map((d, index) => (
                              <tr className="dep-tr" key={index}>
                                <td className="name-container">
                                  {d.warehouseName}-{d.area}
                                </td>
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
                                    onClick={() => handleDelete(d)}
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
          )}
          {stores && stores.length > 10 && (
            <span className="contact-view-more" onClick={handleSeeMore}>
              {storeCount > stores.length ? "View Less" : "View More"}
            </span>
          )}
        </div>
      </>
    )
  );
};

export default InventoryStores;
