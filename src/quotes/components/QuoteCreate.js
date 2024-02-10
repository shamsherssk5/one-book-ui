import React, { useEffect, useRef, useState } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import axios from "axios";
import g_plus from "../../assets/images/g_plus.png";
import QuoteClose from "../../estimate/images/est-close.png";
import QuoteOpen from "../../estimate/images/est-open.png";
import QuoteCreateRow from "./QuoteCreateRow";
import toast from "react-hot-toast";
import { parseFloatEst } from "../../estimate/parseFloatEst";
const QuoteCreate = ({
  originalData,
  customers,
  setCustomers,
  currentUser,
  setToken,
  materials,
  setStats,
  attachments,
  handleBack,
  handleNavigation,
  view,
  loading,
  financialDetails,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const ref = useRef(null);
  const scrollRef = useRef(null);
  const [quoteList, setQuoteList] = useState([]);
  const [save, setSave] = useState("Save");
  const [errorID, setErrorID] = useState();
  const [isAnyRequestActive, setIsAnyRequestActive] = useState(false);
  const handleRowAddition = async () => {
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT + "/quotes/row-addition",
        { quoteID: formData.quoteID, taxPercentage: formData.taxPercentage },
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
        if (res.data && res.data.length > 0) {
          setQuoteList((prev) => [...prev, ...res.data]);
        }
      })
      .catch((err) => {});
  };
  const [style, setStyle] = useState({
    height: "10vh",
  });
  const [refNum, setRefNum] = useState("QUO-XXXX");
  const emptyFormData = {
    quoteID: "",
    projName: "",
    reference: "",
    customer: "",
    custID: "",
    contactName: "",
    contactEmail: "",
    taxType: financialDetails.saleTax,
    taxPercentage: financialDetails.saleTaxPer,
    currency: financialDetails.currType,
    taxLabel: financialDetails.taxLabal,
    additionalNotes: "",
    total: "",
    discount: "",
    orgID: currentUser.orgID,
    createdBy: currentUser.username,
  };

  const [isProjvalid, setIsProjValid] = useState(true);

  const [formData, setFormdata] = useState(emptyFormData);

  const handleFormChange = (e) => {
    setFormdata({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (e.target.name === "projName") {
      let quote = originalData.find((et) => et.projName === e.target.value);
      setIsProjValid(!quote);
    }
  };
  const updateBackend = async (name, value) => {
    if (!value) return;
    setIsAnyRequestActive(true);
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/quotes/update-quote-form?timeZone=" +
          currentUser.timeZone,
        {
          property: name,
          value: value,
          quoteID: formData.quoteID,
        },
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
        setIsAnyRequestActive(false);
      })
      .catch((err) => {
        console.log(err);
        setIsAnyRequestActive(false);
        setFormdata({
          ...formData,
          [name]: formData[name],
        });
      });
  };

  const handleSave = async () => {
    document.body.click();
    let result = validateFormdata();
    if (result && save == "Save") {
      setSave("Saving...");
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/quotes/create-quote?timeZone=" +
            currentUser.timeZone,
          { formData, attachments },
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then(async (res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          toast.success("Quote Saved Successfully");
          if (res.data) {
            await handleNavigation(formData.quoteID);
          }
          setSave("Save");
          setFormdata(emptyFormData);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Quote creation failed");
          setSave("Save");
        });
    }
  };
  const validateFormdata = () => {
    if (!formData.projName) {
      toast.error("Please Enter Project Name");
      setIsOpen(true);
      return false;
    } else if (!isProjvalid) {
      toast.error("Project Name Already Exists");
      setIsOpen(true);
      return false;
    } else if (!formData.customer) {
      toast.error("Please Select Customer");
      setIsOpen(true);
      return false;
    } else if (!formData.total) {
      toast.error("Please Add Materials Or Products");
      return false;
    } else if (quoteList) {
      let res = true;
      quoteList.forEach((quote, i) => {
        if (quote.value && quote.value.quoteRow) {
          let total = 0;
          if (quote.value.quoteRow.isMatList) {
            total = parseFloatEst(quote.value.materialStat.total || 0);
          } else {
            total =
              parseFloatEst(quote.value.quoteRow.unitPrice || 0) *
              parseFloatEst(quote.value.quoteRow.qty || 0);
          }
          if (quote.value.quoteRow.name && !total) {
            toast.error(
              (quote.value.quoteRow.isMatList
                ? "Please Select Product/Material from the Table at Row:"
                : "Please Enter Qty and Unit price at Row:") +
                (i + 1)
            );
            setErrorID(quote.id);
            res = false;
          } else if (total && !quote.value.quoteRow.name) {
            toast.error("Please Enter Item Name at Row:" + (i + 1));
            setErrorID(quote.id);
            res = false;
          }
        }
      });
      return res;
    }
    return true;
  };
  useEffect(() => {
    setErrorID();
    let total = quoteList
      .map((quote) => {
        if (quote.value && quote.value.quoteRow) {
          if (quote.value.quoteRow.isMatList) {
            return parseFloatEst(quote.value.materialStat.total || 0);
          } else {
            return (
              parseFloatEst(quote.value.quoteRow.unitPrice || 0) *
              parseFloatEst(quote.value.quoteRow.qty || 0)
            );
          }
        }
        return 0;
      })
      .reduce((a, b) => a + b, 0);
    let profit = quoteList
      .map((quote) => {
        if (quote.value && quote.value.quoteRow) {
          if (quote.value.quoteRow.isMatList) {
            return parseFloatEst(quote.value.materialStat.profit || 0);
          } else {
            return (
              parseFloatEst(quote.value.quoteRow.unitPrice || 0) *
                parseFloatEst(quote.value.quoteRow.qty || 0) -
              parseFloatEst(quote.value.quoteRow.discount || 0)
            );
          }
        }
        return 0;
      })
      .reduce((a, b) => a + b, 0);
    let quoteTotal = quoteList
      .map((quote) => {
        if (quote.value && quote.value.quoteRow) {
          if (quote.value.quoteRow.isMatList) {
            return (
              parseFloatEst(quote.value.materialStat.total || 0) -
              parseFloatEst(quote.value.materialStat.discount || 0) -
              parseFloatEst(quote.value.materialStat.profit || 0)
            );
          } else {
            return 0;
          }
        }
        return 0;
      })
      .reduce((a, b) => a + b, 0);
    let discount = quoteList
      .map((quote) => {
        if (quote.value && quote.value.quoteRow) {
          if (quote.value.quoteRow.isMatList) {
            return parseFloatEst(quote.value.materialStat.discount || 0);
          } else {
            return parseFloatEst(quote.value.quoteRow.discount || 0);
          }
        }
        return 0;
      })
      .reduce((a, b) => a + b, 0);
    let totalTax =
      (parseFloatEst(formData.taxPercentage) * (total - discount)) / 100;
    let quoteTax =
      (parseFloatEst(formData.taxPercentage) * (quoteTotal + profit)) / 100;
    let categories = [];
    quoteList.forEach((quote) => {
      if (
        quote.value &&
        quote.value.quoteRow &&
        quote.value.quoteRow.isMatList
      ) {
        let categ = quote.value.materialStat.matList
          .filter((mat) => !!mat.value)
          .map((mat) => mat.value)
          .map((mat) => {
            let category;
            if (mat.margin === "fixed") {
              category = {
                category: "Fixed",
                margin: 0,
                cost: mat.total,
                sellingPrice: mat.sellingPrice,
              };
            } else {
              category = {
                category: mat.selectedValue.category || "UnSpecified",
                margin: mat.margin,
                cost: mat.total,
                sellingPrice: mat.sellingPrice,
              };
            }
            return category;
          });
        categories = [...categories, ...categ];
      }
    });

    setStats({
      total: total,
      discount: discount,
      netTotal: total - discount,
      totalTax: formData.taxType === "no" ? 0 : totalTax,
      grandTotal:
        total - discount + (formData.taxType === "exclusive" ? totalTax : 0),
      isCreate: true,
      quoteTotal: quoteTotal,
      quoteProfit: profit,
      quoteTax: formData.taxType === "no" ? 0 : quoteTax,
      quoteSellingPrice:
        quoteTotal + profit + (formData.taxType === "exclusive" ? quoteTax : 0),
      categories: categories,
      currency: formData.currency,
      taxLabel: formData.taxLabel,
      taxPercentage: formData.taxPercentage,
    });
    setFormdata({
      ...formData,
      total: total,
      discount: discount,
      netTotal: total - discount,
      totalTax: formData.taxType === "no" ? 0 : totalTax,
      grandTotal:
        total - discount + (formData.taxType === "exclusive" ? totalTax : 0),
    });
  }, [quoteList, formData.taxType]);

  useEffect(async () => {
    if (view !== "quote-create") return;
    loading({ visibility: true, message: "Loading..." });
    await axios
      .post(
        process.env.REACT_APP_API_ENDPOINT +
          "/quotes/create-initial-quote?timeZone=" +
          currentUser.timeZone,
        {
          orgID: currentUser.orgID,
          createdBy: currentUser.username,
          taxPercentage: formData.taxPercentage,
          taxType: formData.taxType,
          currency: formData.currency,
          taxLabel: formData.taxLabel,
        },
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
        loading({ visibility: false });
        if (res.data.quote && res.data.quote.length > 0) {
          setRefNum(res.data.quote[0].refText + res.data.quote[0].refNum);
          setFormdata({ ...formData, quoteID: res.data.quote[0].quoteID });
          if (res.data.rowID) {
            setQuoteList([{ id: res.data.rowID, value: null }]);
          }
        } else {
          handleBack();
        }
      })
      .catch((err) => {
        console.log(err);
        loading({ visibility: false });
        toast.error("Initial SetUP Failed");
        handleBack();
      });
  }, [view]);
  useEffect(() => {
    const handleResize = (e) => {
      let h = 0;
      let padding = "4vh";
      if (ref.current !== null) {
        h = ref.current.clientHeight;
      }
      if (!isOpen) {
        padding = "8vh";
      }
      let openHeight = !isOpen ? "8.35vh" : "0px";
      setStyle({ height: `calc(100% - ${h}px - ${padding} + ${openHeight})` });
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isOpen]);

  const handleOpenClose = () => {
    setIsOpen(!isOpen);
  };

  const [contacts, setContacts] = useState([]);
  const [isContactsLoading, setIsContactsLoading] = useState(false);

  const getContacts = async (custID) => {
    setIsContactsLoading(true);
    await axios
      .get(
        process.env.REACT_APP_API_ENDPOINT +
          "/customers/customers-contact-list?custID=" +
          custID,
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
        setCustomers((prev) => {
          let updated = [...prev].map((cust) => {
            if (cust.custID === custID) {
              cust["contacts"] = res.data;
            }
            return cust;
          });
          return updated;
        });
        setContacts(res.data);
        setIsContactsLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setIsContactsLoading(false);
      });
  };

  const handleCustomerChange = async (selected) => {
    if (!!selected.__isNew__) {
      setContacts([]);
      let d = new Date(
        new Date().toLocaleString("en-US", { timeZone: currentUser.timeZone })
      );
      let data = {
        customerDetails: {
          custID: "",
          custName: selected.label,
          businessType: "",
          address: "",
          country: "",
          state: "",
          emailAccounts: "",
          phone: "",
          c_managers: [],
          category: "preferred",
          orgID: currentUser.orgID,
          assignee: currentUser.username,
          created_date:
            d.getFullYear().toString() +
            "-" +
            (d.getMonth() + 1).toString() +
            "-" +
            d.getDate().toString(),
        },
        customerFinance: {
          f_license_number: "",
          f_expiry_date: "",
          f_vat_reg_num: "",
          f_credit_limit: "",
          f_credit_period: "",
          f_contact_person: "",
          f_email: "",
          f_phone: "",
        },
        invoiceAddress: {
          address: "",
          country: "",
          state: "",
          email: "",
          phone: "",
        },
        deliveryAddress: {
          address: "",
          country: "",
          state: "",
          email: "",
          phone: "",
        },
      };
      await axios
        .post(
          process.env.REACT_APP_API_ENDPOINT +
            "/customers/create-customer?timeZone=" +
            currentUser.timeZone,
          data,
          { headers: { Authorization: window.localStorage.getItem("token") } }
        )
        .then((res) => {
          if (res.data.error) {
            setToken(undefined);
          }
          toast.success("Customer created successfully");
          setFormdata({
            ...formData,
            customer: selected.label,
            custID: res.data.insertId,
            contactName: "",
            contactEmail: "",
          });
          updateBackend("customer", selected.label);
          updateBackend("custID", res.data.insertId);
          updateBackend("contactName", "");
          updateBackend("contactEmail", "");
          let customer = {
            custID: res.data.insertId,
            custName: selected.label,
            address: "",
            country: "",
            state: "",
            emailAccounts: "",
            phone: "",
          };
          setCustomers([...customers, customer]);
        })
        .catch((err) => {
          console.log(err);
          toast.error("Customer creation failed");
        });
    } else {
      let customer = customers.find((cust) => cust.custID === selected.value);
      if (customer && customer.contacts && customer.contacts.length) {
        setContacts(customer.contacts);
      } else {
        getContacts(customer.custID);
      }
      setFormdata({
        ...formData,
        customer: selected.label,
        custID: selected.value,
        contactName: undefined,
        contactEmail: undefined,
      });
      updateBackend("customer", selected.label);
      updateBackend("custID", selected.value);
      updateBackend("contactName", "");
      updateBackend("contactEmail", "");
    }
  };
  useEffect(() => {
    if (formData.grandTotal) {
      updateBackend("amount", formData.grandTotal);
    }
  }, [formData.grandTotal]);
  return (
    <div className="est-details-main-div">
      <img
        src={isOpen ? QuoteOpen : QuoteClose}
        onClick={handleOpenClose}
        className="est-open-close"
      />
      {isOpen && (
        <div className="est-details-projname-container">
          <span className="est-proj-container">
            <p className="proj-ref-text">{refNum}</p>
            <p className="projName-text est-p-input">
              Project Name:
              <input
                className="est-input"
                type="text"
                name="projName"
                value={formData.projName}
                onChange={handleFormChange}
                onBlur={(e) => updateBackend(e.target.name, e.target.value)}
                style={{ width: "22vw" }}
                autoFocus
              />
            </p>
            <div className="est-feedback text-right">
              {formData.projName && !isProjvalid && (
                <span className="invalid">Project Already Exists</span>
              )}
              {formData.projName && isProjvalid && (
                <span className="valid">Project Name Available</span>
              )}
            </div>
          </span>
          <span className="est-proj-container est-ref-container">
            <p className="proj-ref-text" style={{ visibility: "hidden" }}>
              {refNum}
            </p>
            <p className="projName-text est-p-input reference">
              Reference:
              <input
                className="est-input"
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleFormChange}
                onBlur={(e) => updateBackend(e.target.name, e.target.value)}
                style={{ width: "20vw" }}
              />
            </p>
          </span>
        </div>
      )}
      <div
        className="est-details-table-container est-create-table-container"
        style={!isOpen ? { paddingTop: "4vh", height: "calc(100% - 5vh)" } : {}}
      >
        {isOpen && (
          <div className="est-detailes-table-top-cont" ref={ref}>
            <table
              className="equalDivide est-customer-details-cont"
              cellPadding="0"
              cellSpacing="0"
              width="100%"
              border="0"
            >
              <tbody>
                <tr>
                  <td className="table-heading">Customer</td>
                  <td className="table-heading">Attn:</td>
                </tr>
                <tr>
                  <td
                    className="category-dark"
                    style={{
                      paddingRight: "10vw",
                    }}
                  >
                    <span
                      style={{
                        borderBottom: "0.5px solid #c4c4c4",
                        width: "100%",
                        display: "block",
                      }}
                    >
                      <CreatableSelect
                        isLoading={customers.length <= 0}
                        isSearchable={true}
                        placeholder={"Select Customer"}
                        name="customer"
                        value={
                          formData.customer
                            ? {
                                label: formData.customer,
                                value: formData.custID,
                              }
                            : undefined
                        }
                        onChange={handleCustomerChange}
                        options={customers.map((p) => {
                          return {
                            value: p.custID,
                            label: p.custName,
                          };
                        })}
                      />
                    </span>
                  </td>
                  <td>
                    <table
                      cellPadding="0"
                      cellSpacing="0"
                      width="100%"
                      border="0"
                    >
                      <tbody>
                        <tr style={{ width: "100%!important" }}>
                          <td className="category-dark">
                            {formData.contactEmail}
                          </td>
                        </tr>
                        <tr>
                          <td
                            className="table-heading"
                            style={{
                              paddingRight: "10vw",
                            }}
                          >
                            <span
                              style={{
                                borderBottom: "0.5px solid #c4c4c4",
                                width: "100%",
                                display: "block",
                              }}
                            >
                              <Select
                                isLoading={isContactsLoading}
                                isSearchable={true}
                                placeholder={"Select Contact"}
                                name="contact"
                                key={`my_unique_select_key__${formData.customer}`}
                                value={
                                  formData.customer && formData.contactName
                                    ? {
                                        label: formData.contactName,
                                        value: formData.contactEmail,
                                      }
                                    : undefined
                                }
                                onChange={(selected) => {
                                  setFormdata({
                                    ...formData,
                                    contactEmail: selected.value,
                                    contactName: selected.label,
                                  });
                                  updateBackend("contactEmail", selected.value);
                                  updateBackend("contactName", selected.label);
                                }}
                                isDisabled={!formData.customer}
                                options={contacts.map((p) => {
                                  return {
                                    value: p.email,
                                    label: p.name,
                                  };
                                })}
                              />
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
            <span className="tax-type-container">
              <select
                className="est-entry-select"
                name="taxType"
                value={formData.taxType}
                onChange={(e) => {
                  handleFormChange(e);
                  updateBackend(e.target.name, e.target.value);
                }}
                required
              >
                <option value="exclusive">Tax Exclusive</option>
                <option value="inclusive">Tax Inclusive</option>
                <option value="no" selected>
                  No Tax
                </option>
              </select>
            </span>
          </div>
        )}
        <div
          className="list-container-box est-detailes-table-bottom-cont"
          style={style}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              border: "0.5px solid #c4c4c4",
              borderRadius: "2px",
              borderBottom: "none",
            }}
          >
            <table className="list-view-table">
              <thead className="thead-class">
                <tr className="list-view-header-row">
                  <th width="40%" style={{ paddingLeft: "2.65vw" }}>
                    Item & Description
                  </th>
                  <th
                    width="11%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Qty
                  </th>
                  <th
                    width="13%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Unit Price
                  </th>
                  <th
                    width="11%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Discount
                  </th>
                  <th
                    width="8%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Tax %
                  </th>
                  <th
                    width="17%"
                    style={{ textAlign: "right", paddingRight: "2.6vw" }}
                  >
                    Amount({formData.currency})
                  </th>
                </tr>
              </thead>
              <tbody className="tbody-class est-tbody-create" ref={scrollRef}>
                {quoteList.map((m) => (
                  <QuoteCreateRow
                    materials={materials}
                    quoteList={quoteList}
                    setQuoteList={setQuoteList}
                    key={m.id}
                    index={m.id}
                    haveErrors={m.id === errorID}
                    setToken={setToken}
                    scrollRef={scrollRef}
                    quoteID={formData.quoteID}
                    setIsAnyRequestActive={setIsAnyRequestActive}
                    tax={formData.taxPercentage}
                  />
                ))}
                <tr>
                  <td style={{ padding: "1vh 1.85vw" }}>
                    <img
                      className="g_plus customers est-create"
                      src={g_plus}
                      onClick={handleRowAddition}
                    />
                  </td>
                </tr>
                <tr className="empty-row-container">
                  <td width="100%" className="border-td" colSpan="8">
                    <div className="est-details-note-total-container">
                      <table
                        className="equalDivide"
                        cellPadding="0"
                        cellSpacing="0"
                        width="100%"
                        border="0"
                      >
                        <tbody>
                          <tr>
                            <td
                              colSpan="2"
                              className="table-heading category-dark"
                              style={{
                                paddingLeft: "1.85vw",
                                paddingBottom: "0.7vh",
                              }}
                            >
                              Additional Notes
                            </td>
                          </tr>
                          <tr width="100%">
                            <td
                              className="table-heading"
                              width="50%"
                              style={{
                                paddingLeft: "1.85vw",
                                position: "relative",
                              }}
                            >
                              <span className="est-add-note-container entry create">
                                <textarea
                                  name="additionalNotes"
                                  value={formData.additionalNotes}
                                  className="est-add-notes-input"
                                  onChange={handleFormChange}
                                  onBlur={(e) =>
                                    updateBackend(e.target.name, e.target.value)
                                  }
                                />
                              </span>
                            </td>
                            <td width="50%" style={{ paddingLeft: "9vw" }}>
                              <table
                                className="equalDivide est-total-container"
                                cellPadding="0"
                                cellSpacing="0"
                                width="100%"
                                border="0"
                              >
                                <tr>
                                  <td width="50%" className="table-heading">
                                    Total
                                  </td>
                                  <td className="table-heading" align="right">
                                    {(formData.total || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                  <td className="table-heading">Discount</td>
                                  <td className="table-heading" align="right">
                                    {(formData.discount || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                  <td className="table-heading category-dark">
                                    Net total
                                  </td>
                                  <td
                                    className="table-heading category-dark"
                                    align="right"
                                  >
                                    {(formData.netTotal || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                  <td className="table-heading">
                                    Total Tax ({formData.taxPercentage}%)
                                  </td>
                                  <td className="table-heading" align="right">
                                    {(formData.totalTax || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                                <tr></tr>
                                <tr>
                                  <td
                                    className="table-heading category-dark"
                                    style={{ background: "#E4F3E8" }}
                                  >
                                    Grand Total Amount
                                  </td>
                                  <td
                                    className="table-heading category-dark"
                                    align="right"
                                    style={{ background: "#E4F3E8" }}
                                  >
                                    {(formData.grandTotal || 0).toLocaleString(
                                      navigator.language,
                                      {
                                        minimumFractionDigits: 2,
                                      }
                                    )}
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="est-save-cancel-button">
        <table
          className="equalDivide"
          cellPadding="0"
          cellSpacing="0"
          width="100%"
          border="0"
        >
          <tbody>
            <tr>
              <td
                style={{
                  padding: "0 5.62vw",
                }}
              >
                <button
                  className="save-button est"
                  style={{ background: "#7C7C7C" }}
                  onClick={handleBack}
                >
                  Cancel
                </button>
              </td>
              <td align="right" style={{ padding: "0 4.1vw" }}>
                {isAnyRequestActive ? (
                  <button
                    className="save-button est"
                    style={{ background: "#7C7C7C", cursor: "not-allowed" }}
                  >
                    {save}
                  </button>
                ) : (
                  <button className="save-button est" onClick={handleSave}>
                    {save}
                  </button>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuoteCreate;
