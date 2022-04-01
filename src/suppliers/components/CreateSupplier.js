import { Country, State } from "country-state-city";
import { useEffect, useRef, useState } from "react";
import DatePicker from "react-date-picker";
import Open from "../../assets/images/next.png";
import Gap from "../../common/Gap";
import FileUploaderListViewer from "../../common/FileUploaderListViewer";
import axios from "axios";
import PhoneInput from "react-phone-input-2";
import toast from "react-hot-toast";

const CreateSupplier = ({ industryType, setindustryType, rightContent, setToken, setData, contacts,setRightContent }) => {
    let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
    const [error, setError] = useState(undefined);
    const [SubmitButton, setSubmitButton] = useState("Save");
    const ref = useRef(null);
    let emptyFormData = {
        supID: "",
        custName: "",
        businessType: "",
        address: "",
        country: "",
        state: "",
        emailAccounts: "",
        phone: "",
        notee: "",
        category: "preferred",
        orgID: currentUser.orgID,
        assignee: currentUser.username,
    }

    const [formData, setFormdata] = useState(emptyFormData);
    useEffect(async () => {
        if (industryType.length > 0) return;
        if (rightContent !== "Create" && rightContent !== "Edit Company Info") return;
        await axios.get(process.env.REACT_APP_API_ENDPOINT + '/settings/industries', { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setindustryType(res.data);
            }).catch((err) => {
                console.log(err);
            })

    }, [rightContent])

    const emptyFinance = {
        f_license_number: "",
        f_expiry_date: "",
        f_vat_reg_num: "",
        f_credit_limit: "",
        f_credit_period: "",
        f_contact_person: "",
        f_email: "",
        f_phone: ""
    }
    const [financialFormData, setFinancialFormData] = useState(emptyFinance);

    const handleCustomerSave = () => {
        if (validateCustomerInfo()) {
            setError("Please fill out all Supplier Details");
            ref.current.scrollTop = 0;
            return;
        } else if (emailValidation(formData.emailAccounts)) {
            setError("Enter Valid Email in Supplier Details");
            ref.current.scrollTop = 0;
            return;
        }
        else if (validateCustomerFinancialInfo()) {
            setError("Please fill out all Supplier's Financial Details");
            setOpenFinance(true);
            ref.current.scrollTop = 0;
            return;
        } else if (emailValidation(financialFormData.f_email)) {
            setError("Enter Valid Email in Supplier's Financial Details");
            setOpenFinance(true);
            ref.current.scrollTop = 0;
            return;
        }else if(!start){
            setError("Select Expiry Date in Supplier's Financial Details");
            setOpenFinance(true);
            ref.current.scrollTop = 0;
            return;
        }
        setSubmitButton("...Saving");

    }

    useEffect(async () => {
        if (SubmitButton === "...Saving") {
            formData['attachments'] = files;
            let d = new Date(new Date().toLocaleString("en-US", {timeZone: currentUser.timeZone}));
            formData['created_date']= d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString() + "-" + d.getDate().toString();
            financialFormData.f_expiry_date=start.getFullYear().toString() + "-" + (start.getMonth() + 1).toString() + "-" + start.getDate().toString();
            let data = {
                "customerDetails": formData,
                "customerFinance": financialFormData,
            }
            await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/create-supplier?timeZone='+currentUser.timeZone, data, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }
                    toast.success("Supplier created successfully");
                    formData['supID'] = res.data.supID;
                    formData['attachments'] = files;
                    formData["refText"] = "SUP-"
                    formData["refNum"] = "1000";
                    formData["notes"] = [{
                        note: formData.notee,
                        supID: res.data.supID,
                        created_by: formData.assignee,
                        note_time: d.getFullYear().toString() + "-" + (d.getMonth() + 1).toString() + "-" + d.getDate().toString()+" "+d.getHours().toString() + ":" + d.getMinutes().toString() + ":" + d.getSeconds().toString(),
                        id: res.data.noteID
                    }]
                    setData(prev => [...prev, formData]);
                    setFiles([]);
                    setSubmitButton("Save");
                    setFormdata(emptyFormData);
                    setFinancialFormData(emptyFinance);
                    setRightContent("Business Types");
                    setError();
                    setStart();
                }).catch((err) => {
                    console.log(err);
                    toast.error("Supplier creation failed");
                    setSubmitButton("Save")
                })
        }

    }, [SubmitButton])

    const validateCustomerInfo = () => {
        var keys = ['custName', 'businessType', 'address', 'country', 'emailAccounts', 'phone'];
        return keys.some((key) => { return formData[key].toString().trim().length == 0 });
    }

    const validateCustomerFinancialInfo = () => {
        var keys = ['f_license_number', 'f_vat_reg_num', 'f_credit_limit', 'f_credit_period', 'f_contact_person', 'f_email', 'f_phone'];
        return keys.some((key) => { return financialFormData[key].toString().trim().length == 0 });
    }
    
    const emailValidation = (value) => {
        let mailformat = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return !value.match(mailformat);

    }

    const [files, setFiles] = useState([]);
    const handleDelete = (id) => {
        setFiles(prev => {
            let f = prev.filter(file => file.fileID !== id)
            return f;
            ;
        })
    }

    const handleUpload = (file) => {
        setFiles((prev) => {
            return [...prev, file];
        });
    }

    const [openFinance, setOpenFinance] = useState(false);
    const [countryList, setCountryList] = useState(Country.getAllCountries());

    const handleFormChange = (e) => {
        setError(undefined);
        setFormdata({ ...formData, [e.target.name]: e.target.value });
    }

    const handleFinancialFormChange = (e) => {
        setError(undefined);
        setFinancialFormData({ ...financialFormData, [e.target.name]: e.target.value });
    }


    const [start, setStart] = useState();
    return (
        rightContent === "Create" &&
        <div className="task-details-box " ref={ref}>
            <div className="create-task-container task-details-container">
                <form name="taskForm" autoComplete="off">
                    <div className="task-form-container">
                        {error ? <div>
                            <span class="warning-text-error warning-text" >{error}</span>
                        </div> : ''}
                        <fieldset>
                            <legend>
                                Company Name
                            </legend>
                            <input type="text" name="custName" value={formData.custName} onChange={handleFormChange} placeholder="Enter Company Full Name" />
                        </fieldset>
                        <fieldset>
                            <legend>
                                Business Type
                            </legend>
                            <select className="title" name="businessType" value={formData.businessType} onChange={handleFormChange} required>
                                <option value="" disabled selected >Select Business Type</option>
                                {industryType && industryType.map(
                                    (item, i) => { return <option key={item.id} value={item.name}>{item.name}</option> }
                                )}
                            </select>
                        </fieldset>
                        <fieldset>
                            <legend>
                                Company Address
                            </legend>
                            <textarea id="notes" name="address" value={formData.address} onChange={handleFormChange} placeholder="Enter Company Address" maxLength="150" />
                        </fieldset>
                        <div style={{ width: "100%", display: "flex" }}>
                            <div style={{ width: "48%" }}>
                                <fieldset>
                                    <legend>
                                        Country
                                    </legend>
                                    <select className="title" name="country" value={formData.country} onChange={handleFormChange} required>
                                        <option value="" disabled selected >Select Country</option>
                                        {countryList && countryList.map(
                                            (item, i) => { return <option key={item.isoCode} value={item.isoCode}>{item.name}</option> }
                                        )}
                                    </select>
                                </fieldset>

                            </div>
                            <div style={{ width: "48%", left: "4%", position: "relative" }}>
                                <fieldset>
                                    <legend>
                                        State
                                    </legend>
                                    <select className="title" name="state" value={formData.state} onChange={handleFormChange} required>
                                        <option value="" disabled selected >Select State</option>
                                        {formData.country && formData.country.trim().length > 0 &&
                                            State.getStatesOfCountry(formData.country).map((item, i) => { return <option key={item.isoCode} value={item.isoCode}>{item.name}</option> })
                                        }
                                    </select>
                                </fieldset>
                            </div>
                        </div>

                        <fieldset>
                            <legend>
                                E-mail
                            </legend>
                            <input type="text" name="emailAccounts" value={formData.emailAccounts} onChange={handleFormChange} placeholder="Enter Company Email" />
                        </fieldset>
                        <fieldset>
                            <legend>
                                Phone Number
                            </legend>
                            <PhoneInput
                                country={"in"}
                                value={formData.phone}
                                placeholder="Enter Company Phone Number"
                                onChange={p => setFormdata({ ...formData, phone: p })}
                            />
                        </fieldset>
                        <fieldset>
                            <legend>
                                Notes
                            </legend>
                            <textarea id="notes" name="notee" value={formData.notee} onChange={handleFormChange} placeholder="Enter Notes (Optional)" maxLength="150" />
                        </fieldset>

                    </div>
                </form>
            </div>
            <div className="financial-details-Box task-details-container">
                <div className="financial-box-header">
                    Financial Details
                </div>
                <div className="finacial-box-image-container">
                    <img style={openFinance ? { transform: "rotate(90deg)" } : {}} src={Open} onClick={() => { setOpenFinance(!openFinance) }} />
                </div>
            </div>
            {openFinance && <div className="create-task-container task-details-container">
                <div style={{ width: "100%", display: "flex" }}>
                    <div style={{ width: "48%" }}>
                        <fieldset>
                            <legend>
                                Trade License No.
                            </legend>
                            <input type="text" name="f_license_number" value={financialFormData.f_license_number} onChange={handleFinancialFormChange} placeholder="Trade License No." />
                        </fieldset>

                    </div>
                    <div className="customer-licence-expiry" style={{ width: "48%", left: "4%", position: "relative" }}>
                        <fieldset>
                            <legend>
                                Expiry Date
                            </legend>
                            <DatePicker
                                dayPlaceholder="DD"
                                monthPlaceholder='MM'
                                yearPlaceholder='YYYY'
                                onChange={setStart}
                                value={start}
                                required={true}
                                calendarIcon={null}
                                clearIcon={null}
                            />
                        </fieldset>
                    </div>
                </div>
                <fieldset>
                    <legend>
                        VAT Registration Number
                    </legend>
                    <input type="text" name="f_vat_reg_num" value={financialFormData.f_vat_reg_num} onChange={handleFinancialFormChange} placeholder="Enter VAT Registration Number" />
                </fieldset>

                <div style={{ width: "100%", display: "flex" }}>
                    <div style={{ width: "48%" }}>
                        <fieldset>
                            <legend>
                                Credit Limit
                            </legend>
                            <input type="text" name="f_credit_limit" value={financialFormData.f_credit_limit} onChange={handleFinancialFormChange} placeholder="Approved Credit Limit" />
                        </fieldset>

                    </div>
                    <div style={{ width: "48%", left: "4%", position: "relative" }}>
                        <fieldset>
                            <legend>
                                Credit Period
                            </legend>
                            <input type="text" name="f_credit_period" value={financialFormData.f_credit_period} onChange={handleFinancialFormChange} placeholder="Credit Period" />
                        </fieldset>
                    </div>
                </div>
                <fieldset>
                    <legend>
                        Contact Person (Accounts)
                    </legend>
                    <select className="title" name="f_contact_person" value={financialFormData.f_contact_person} onChange={handleFinancialFormChange} required>
                        <option value="" disabled selected >Contact Person Finance Department</option>
                        {contacts && contacts.map(
                            (item, i) => { return <option key={item.id} value={item.name}>{item.name}</option> }
                        )}
                    </select>

                </fieldset>
                <fieldset>
                    <legend>
                        Email Id (Accounts)
                    </legend>
                    <input type="text" name="f_email" value={financialFormData.f_email} onChange={handleFinancialFormChange} placeholder="Auto Generate statements will send to this email id" />
                </fieldset>
                <fieldset>
                    <legend>
                        Phone Number (Accounts)
                    </legend>
                    <PhoneInput
                        country={"in"}
                        value={financialFormData.f_phone}
                        placeholder="Enter Company Phone Number"
                        onChange={p => setFinancialFormData({ ...financialFormData, f_phone: p })}
                    />
                </fieldset>
            </div>}


            <div className="create-task-container task-details-container">
                <div className="submit-button-container">
                    <input className="submit-button" type="button" value={SubmitButton} onClick={handleCustomerSave} />
                </div>
            </div>
            <Gap />
            <FileUploaderListViewer isView={false} setToken={setToken} data={files} handleUpload={handleUpload} handleDelete={handleDelete} module="supplier" id={undefined} />
        </div>


    )
}
export default CreateSupplier;