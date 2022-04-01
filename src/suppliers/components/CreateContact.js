import React, { useEffect, useState } from 'react';
import Edit_Button from "../../tasks/assets/edit-but.png";
import Delete_Button from "../../tasks/assets/delete-but.png";
import axios from 'axios';
import PhoneInput from 'react-phone-input-2';
import toast from 'react-hot-toast';

const CreateContact = ({ rightContent, contacts, setContacts, setToken }) => {
    let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
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
        if (contacts.length > 0) return;
        if (rightContent === "CreateContact" || rightContent === "Create" || rightContent==="Company Info") {
            await axios.get(process.env.REACT_APP_API_ENDPOINT + '/suppliers/suppliers-contact-list?orgID=' + currentUser.orgID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }
                    setContacts(res.data);
                }).catch((err) => {
                    console.log(err);
                })

        }
    }, [rightContent])

    const handleFormChange = (e) => {
        setError(undefined);
        setFormdata({ ...formData, [e.target.name]: e.target.value });
    }

    const handleEdit = (d) => {
        setFormdata(d);
        setSubmitButton("Update");
    }
    const handleDelete = async (contact) => {
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/delete-contact', { 'id': contact.id }, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setContacts(prev=>{
                    let updCon=prev.filter(p=>p.id!==contact.id);
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
        if(SubmitButton==="Save")
            setSubmitButton("...Saving");
        else if(SubmitButton==="Update")
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
                }).catch((err) => {
                    console.log(err);
                    toast.error("Contact creation failed");
                    setSubmitButton("Save");
                })
        }else if(SubmitButton==="...Updating"){
            await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/update-contact', formData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }
                    toast.success("Contact Updated successfully");
                    setContacts((prev)=>{
                        let updContacts=prev.filter(c=>{
                            if(formData.id===c.id){
                                c.name=formData.name;
                                c.profession=formData.profession;
                                c.email=formData.email;
                                c.phone=formData.phone;
                            }
                            return c;
                        })
                       return updContacts; 
                    });
                    setSubmitButton("Save");
                    setFormdata(emptyContact);
                }).catch((err) => {
                    console.log(err);
                    toast.error("Contact updation failed");
                    setSubmitButton("Update");
                })
        }
    }, [SubmitButton])

    const handleSeeMore=()=>{
        if (contactCount >= contacts.length) {
            setContactCount(10);
        } else {
            setContactCount(c => c + 10);
        }
    }

    return (
        rightContent === "CreateContact" &&
        <>
            <div className="task-details-box">
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
                {contacts && contacts.length > 0 &&
                    <div className='customer-contact-holder'>
                        <div className="task-details-container">
                            <div className="dep-table" style={{ "paddingTop": "0!important" }}>
                                <table className="equalDivide" cellPadding="0" cellSpacing="0" width="100%" border="0">
                                    <tbody>
                                        {
                                            contacts ? contacts.filter((d, i) => i < contactCount).map((d, index) => <tr className="dep-tr" key={index}><td className="name-container">{d.name}</td><td className="dep-small-td" ><img title="Edit" className="dep-img" onClick={() => handleEdit(d)} src={Edit_Button} /></td><td className="dep-small-td"><img className="dep-img" title="Delete" src={Delete_Button} onClick={() => handleDelete(d)} /></td></tr>) : ""
                                        }
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>}
                {contacts && contacts.length > 10 && <span className='contact-view-more' onClick={handleSeeMore}>{contactCount>contacts.length?'View Less':'View More'}</span>}
            </div>
        </>

    );
};

export default CreateContact;