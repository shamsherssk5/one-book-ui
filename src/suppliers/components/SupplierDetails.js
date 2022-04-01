import React, { useEffect, useRef, useState } from 'react';
import Gap from '../../common/Gap';
import Edit_Button from "../../tasks/assets/edit-but.png";
import Delete_Button from "../../tasks/assets/delete-but.png";
import Dep_plus from "../../tasks/assets/dep-plus.png";
import FileUploaderListViewer from '../../common/FileUploaderListViewer';
import axios from 'axios';
import Back_Button from '../../assets/images/back-button.png';
import PhoneInput from 'react-phone-input-2';
import toast from 'react-hot-toast';
import History from '../../common/History';
import { Country } from 'country-state-city';

const SupplierDetails = ({ rightContent, currentCustomer, setToken, setData, contacts, setContacts }) => {
    let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
    const ref = useRef(null);
    let emptyContact = {
        name: "",
        profession: "",
        phone: "",
        email: "",
        orgID: currentUser.orgID
    }

    const [contactCount, setContactCount] = useState(10);
    const [formData, setFormdata] = useState(emptyContact);
    const [SubmitButton, setSubmitButton] = useState("Save");
    const [error, setError] = useState(undefined);

    useEffect(async () => {
        if(!currentCustomer) return;
        if (currentCustomer.attachments && currentCustomer.attachments.length > 0) return;
        if (rightContent !== "Company Info") return;
        await axios.get(process.env.REACT_APP_API_ENDPOINT + '/files/attachments?ID=supplier' + currentCustomer.supID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setData((prev) => {
                    let updatedData = prev.filter(cust => {
                        if (cust.supID === currentCustomer.supID) {
                            cust["attachments"] = res.data
                        }
                        return cust;
                    })
                    return updatedData;
                })
            }).catch(err => {
                console.log(err);
            })

    }, [currentCustomer])


    useEffect(async () => {
        if(!currentCustomer) return;
        if (currentCustomer.history && currentCustomer.history.length > 0) return;
        await axios.get(process.env.REACT_APP_API_ENDPOINT + '/common/history?ID=supplier' + currentCustomer.supID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setData((prev) => {
                    let updatedData = prev.filter(cust => {
                        if (cust.supID === currentCustomer.supID) {
                            cust["history"] = res.data
                        }
                        return cust;
                    })
                    return updatedData;
                })
            }).catch((err) => {
                console.log(err);
            })

    }, [currentCustomer]);


    const [createContactView, setCreateContactView] = useState(false);
    const handleDelete = (id) => {
        setData(prev => {
            let updatedData = prev.filter(cust => {
                if (cust.supID === currentCustomer.supID) {
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
                if (cust.supID === currentCustomer.supID) {
                    cust.attachments.push(file);
                }
                return cust;
            })
            return updatedData;
        })
    }

    const handleFormChange = (e) => {
        setError(undefined);
        setFormdata({ ...formData, [e.target.name]: e.target.value });
    }

    const handleEdit = (d) => {
        setFormdata(d);
        setSubmitButton("Update");
        setCreateContactView(true);
    }
    const handleDeleteContact = async (contact) => {
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/delete-contact', { 'id': contact.id }, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setContacts(prev => {
                    let updCon = prev.filter(p => p.id !== contact.id);
                    return updCon;
                })
                setFormdata(emptyContact);
                toast.success('Contact deleted successfully');

            }).catch((err) => {
                console.log(err);
                toast.error('Contact Deletion Failed..!');
            })

    }

    const handleContactSave = () => {
        if (formValidation()) {
            setError("Please fill out all Required Details");
            return;
        } else if (emailValidation(formData.email)) {
            setError("Enter Valid Email!");
            return;
        }
        if (SubmitButton === "Save")
            setSubmitButton("...Saving");
        else if (SubmitButton === "Update")
            setSubmitButton("...Updating");

    }

    const formValidation = () => {
        var keys = ['name', 'phone', 'email'];
        return keys.some((key) => { return formData[key].toString().trim().length == 0 });
    }

    const emailValidation = (value) => {
        let mailformat = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
        return !value.match(mailformat);

    }

    useEffect(async () => {
        if (SubmitButton === "...Saving") {
            await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/create-contact', formData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }
                    formData['id'] = res.data.insertId;
                    toast.success("Contact created successfully");
                    setContacts([...contacts, formData]);
                    setSubmitButton("Save");
                    setFormdata(emptyContact);
                    setCreateContactView(false);
                }).catch((err) => {
                    console.log(err);
                    toast.error("Contact creation failed");
                    setSubmitButton("Save");
                })
        } else if (SubmitButton === "...Updating") {
            await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/update-contact', formData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }
                    toast.success("Contact Updated successfully");
                    setContacts((prev) => {
                        let updContacts = prev.filter(c => {
                            if (formData.id === c.id) {
                                c.name = formData.name;
                                c.profession = formData.profession;
                                c.email = formData.email;
                                c.phone = formData.phone;
                            }
                            return c;
                        })
                        return updContacts;
                    });
                    setSubmitButton("Save");
                    setCreateContactView(false);
                    setFormdata(emptyContact);
                }).catch((err) => {
                    console.log(err);
                    toast.error("Contact updation failed");
                    setSubmitButton("Update");
                })
        }
    }, [SubmitButton])

    const handleSeeMore = () => {
        if (contactCount >= contacts.length) {
            setContactCount(10);
        } else {
            setContactCount(c => c + 10);
        }
    }
    return (
        rightContent === "Company Info" && currentCustomer &&
        <div className="task-details-box" ref={ref}>
            <div className="task-details-container">
                <div className="details-container">
                    <div className='user-details-container'>
                        <table className="equalDivide" cellPadding="0" cellSpacing="0" width="100%" border="0">
                            <tbody>
                                <tr className="table-heading">
                                    <td className="blue-heading" colSpan="2">Business Type</td>
                                </tr>
                                <tr>
                                    <td className="table-heading" colSpan="2">{currentCustomer.businessType}</td>
                                </tr>
                                <tr></tr>
                                <tr className="table-heading">
                                    <td className="blue-heading" colSpan="2">Address</td>
                                </tr>
                                <tr>
                                    <td className="table-heading" colSpan="2">{currentCustomer.address}</td>
                                </tr>
                                <tr></tr>
                                <tr className="table-heading">
                                    <td className="blue-heading" colSpan="2">Country</td>
                                </tr>
                                <tr>
                                    <td className="table-heading" colSpan="2">{Country.getCountryByCode(currentCustomer.country).name}</td>
                                </tr>
                                <tr></tr>
                                <tr className="table-heading">
                                    <td className="blue-heading" colSpan="2">Email</td>
                                </tr>
                                <tr>
                                    <td className="table-heading" colSpan="2">{currentCustomer.emailAccounts}</td>
                                </tr>
                                <tr></tr>
                                <tr className="table-heading">
                                    <td className="blue-heading" colSpan="2">Tel Number</td>
                                </tr>
                                <tr>
                                    <td className="table-heading" colSpan="2">{currentCustomer.phone}</td>
                                </tr>
                                <tr></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Gap></Gap>
            {!createContactView ? <>
                <div className="messages task-details-container">
                    <div className="message-Heading">
                        Contacts
                        <img src={Dep_plus} className="contact-plus" onClick={() => setCreateContactView(true)} />
                    </div>
                </div>
                <div className='customer-contact-holder' style={{ marginTop: "5vh" }}>
                    <div className='task-details-container'>
                        <div className="dep-table" style={{ "paddingTop": "0!important" }}>
                            <table className="equalDivide" cellPadding="0" cellSpacing="0" width="100%" border="0">
                                <tbody>
                                    {
                                        contacts ? contacts.filter((d, i) => i < contactCount).map((d, index) => <tr className="dep-tr" key={index}><td className="name-container">{d.name}</td><td className="dep-small-td" ><img title="Edit" className="dep-img" onClick={() => handleEdit(d)} src={Edit_Button} /></td><td className="dep-small-td"><img className="dep-img" title="Delete" src={Delete_Button} onClick={() => handleDeleteContact(d)} /></td></tr>) : ""
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {contacts && contacts.length > 10 && <span className='contact-view-more' onClick={handleSeeMore}>{contactCount > contacts.length ? 'View Less' : 'View More'}</span>}
            </> :
                <>
                    <div className="messages task-details-container">
                        <div className="message-Heading">
                            <img className='contact-back' src={Back_Button} onClick={() => { setCreateContactView(false); setFormdata(emptyContact) }} />
                            Create Contact
                        </div>
                    </div>
                    <div className="create-task-container task-details-container">
                        <form name="taskForm" autoComplete="off">
                            <div className="task-form-container">
                                {error ? <div>
                                    <span class="warning-text-error warning-text" >{error}</span>
                                </div> : ''}
                                <fieldset>
                                    <legend>
                                        Contact Name
                                    </legend>
                                    <input type="text" name="name" value={formData.name} onChange={handleFormChange} placeholder="Enter New Contact Name" />
                                </fieldset>
                                <fieldset>
                                    <legend>
                                        Profession
                                    </legend>
                                    <input type="text" name="profession" value={formData.profession} onChange={handleFormChange} placeholder="Enter Profession (Optional)" />
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
                                        Email
                                    </legend>
                                    <input type="text" name="email" value={formData.email} onChange={handleFormChange} placeholder="Enter Profession (Optional)" />
                                </fieldset>

                            </div>
                        </form>
                    </div>
                    <div className="create-task-container task-details-container">
                        <div className="submit-button-container">
                            <input className="submit-button" type="button" value={SubmitButton} onClick={handleContactSave} />
                        </div>
                    </div>
                </>
            }
            <Gap></Gap>
            {currentCustomer && currentCustomer.attachments && <FileUploaderListViewer isView={true} setToken={setToken} data={currentCustomer.attachments} handleUpload={handleUpload} handleDelete={handleDelete} module="supplier" id={"supplier" + currentCustomer.supID} />}
            <Gap />
            {currentCustomer && currentCustomer.history && <History data={currentCustomer.history} />}
        </div>

    );
};

export default SupplierDetails;