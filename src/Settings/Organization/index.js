import React, { useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';
import './organizationFrom.css'
import axios from 'axios'
import DatePicker from 'react-date-picker';
import Modal from './UploaderBox';
import { Country, State } from 'country-state-city';
import { FilePreviewerThumbnail } from 'react-file-previewer';
const Organization = ({ setNext, setToken, orgData, setOrgdData, actionName, setactionName, loading, settingScroll }) => {
    let emptyOrganization = {
        fullname: "",
        crm: "",
        industry: "",
        address: "",
        state: "",
        country: "",
        telnumber: "",
        emailId: "",
        licenceNo: "",
        registerDate: undefined
    }
    const [submitValue, setSubmitValue] = useState('Next');
    const [error, setError] = useState(false);
    const [formData, setformData] = useState(emptyOrganization);
    let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
    useEffect(async () => {
        if (actionName !== "Organization") return;
        if (formData.id) return;
        if (currentUser && currentUser.orgID === 0) {
            setformData(emptyOrganization);
            return;
        } else {
            settingScroll.current.scrollTop = 0;
            loading({ visibility: true, message: "Loading Organization..." });
            await axios.get(process.env.REACT_APP_API_ENDPOINT + '/settings/getOrganization?ID=' + currentUser.orgID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }

                    if (res.data.length > 0) {

                        res.data[0].registerDate = new Date(res.data[0].registerDate);
                        setformData(res.data[0]);
                    } else {
                        setformData(emptyOrganization);
                    }

                    loading({ visibility: false });

                }).catch((err) => {
                    console.log(err);
                    loading({ visibility: false });
                })
        }
    }, [actionName]);


    const [industryType, setindustryType] = useState([]);

    useEffect(async () => {
        if (industryType.length > 0) return;
        await axios.get(process.env.REACT_APP_API_ENDPOINT + '/settings/industries', { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setindustryType(res.data);
            }).catch((err) => {
                console.log(err);
            })

    }, [])


    const [countryList, setCountryList] = useState(Country.getAllCountries());

    const handleOnChange = (e) => {

        if (e) setformData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (formData.id) {
            setSubmitValue("Update");
        } else {
            setSubmitValue("Save");
        }
    }

    const formValidation = () => {
        return Object.keys(formData).some((key) => { return formData[key].toString().trim().length == 0 });
    }


    const handleNext = async (e) => {
        e.preventDefault();

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
                await axios.post(process.env.REACT_APP_API_ENDPOINT + '/settings/updateOrganization?userID=' + currentUser.id, formData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                    .then((res) => {
                        if (res.data.error) {
                            setToken(undefined);
                        }
                        setOrgdData(prev => {
                            return { ...prev, crm: formData.crm }
                        });
                        toast.success('Organization data updated Sucessfully');
                        setSubmitValue("Next");
                    })
                    .catch(err => {
                        console.log(error);
                        toast.error("Organization updation Failed");
                        setSubmitValue("Next");
                    })

            } else {
                setSubmitValue("...Saving");
                await axios.post(process.env.REACT_APP_API_ENDPOINT + '/settings/createOrganization?userID=' + currentUser.id, formData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                    .then((res) => {
                        if (res.data.error) {
                            setToken(undefined);
                        }
                        toast.success('Organization data saved Sucessfully');
                        setOrgdData(prev => {
                            return { ...prev, crm: formData.crm }
                        });
                        setformData(prev => ({ ...prev, 'id': res.data.id }));
                        currentUser.orgID = res.data.id;
                        window.sessionStorage.setItem("currentUser", JSON.stringify(currentUser));
                        setSubmitValue("Next");
                    })
                    .catch(err => {
                        console.log(error);
                        toast.error("Organization creation Failed");
                        setSubmitValue("Next");
                    })
            }
        };
    }

    const deleteFile = (attachment) => {
        if (attachment && attachment.filename) {
            attachment["module"] = "orgLogo";
            axios.post(process.env.REACT_APP_API_ENDPOINT + '/files/deleteFile', attachment, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }
                    setOrgdData(prev => {
                        return { ...prev, filename: undefined }
                    });
                    toast.success("Logo Deleted Successfully");

                }).catch(err => {
                    toast.error("Logo Deletion Failed");
                    console.log(err);
                })
        } else {
            toast.error("Logo Does not exist");
        }

    }
    return (
        actionName === "Organization" && <div id="organization">
            <div className='org-main-container'>
                <div class='org-form-container create-task-container'>
                    <form id="org-form" name="organization" noValidate autoComplete='off'>
                        {error ? <div>
                            <span style={{ fontSize: "0.73vw", color: "red" }} >{error} </span>
                        </div> : ''}
                        <div className='org-form-left-Div'>
                            <fieldset>
                                <legend>
                                    Organization Full Name
                                </legend>
                                <input type="text" id="fullname" name="fullname" value={formData.fullname} onChange={handleOnChange} placeholder="Enter Organization Name it will appear in the Quots, Invoices, etc.." />
                            </fieldset>
                            <fieldset>
                                <legend>CRM Name</legend>
                                <input type="text" id="crm" name="crm" value={formData.crm} onChange={handleOnChange} placeholder="Organization Name displys in CRM" />
                            </fieldset>
                            <fieldset>
                                <legend>Industry Types</legend>
                                <select className="title" id="industry" name="industry" value={formData.industry} onChange={handleOnChange} required>
                                    <option value="" disabled selected >Select Industry Types</option>
                                    {industryType && industryType.map(
                                        (item, i) => { return <option style={{ color: "#353e46" }} key={item.id} value={item.name}>{item.name}</option> }
                                    )}
                                </select>
                            </fieldset>
                            <fieldset>
                                <legend>Address</legend>
                                <textarea id="notes" name="address" value={formData.address} onChange={handleOnChange} placeholder="Enter address" />
                            </fieldset>
                            <fieldset>
                                <legend>Country</legend>
                                <select className="title" id="country" name="country" value={formData.country} onChange={handleOnChange} required>
                                    <option value="" disabled selected >Select Country </option>
                                    {countryList && countryList.map(
                                        (item, i) => { return <option key={item.isoCode} value={item.isoCode}>{item.name}</option> }
                                    )}
                                </select>
                            </fieldset>
                            <fieldset>
                                <legend>State</legend>
                                <select className="title" id="state" name="state" value={formData.state} onChange={handleOnChange} required>
                                    <option value="" disabled selected >Select State </option>
                                    {formData.country && formData.country.trim().length > 0 &&
                                        State.getStatesOfCountry(formData.country).map((item, i) => { return <option key={item.isoCode} value={item.isoCode}>{item.name}</option> })
                                    }
                                </select>
                            </fieldset>
                            <fieldset>
                                <legend>Organization Tel Number</legend>
                                <input type="text" id="telnumber" name="telnumber" value={formData.telnumber} onChange={handleOnChange} placeholder="Tel Number" />
                            </fieldset>
                            <fieldset>
                                <legend>Organization email ID</legend>
                                <input type="email" id="emailId" name="emailId" value={formData.emailId} onChange={handleOnChange} placeholder="email ID , appear in Quotes, Invoices, etc..." />
                            </fieldset>

                            <div style={{ width: "100%", display: "flex" }}>
                                <div style={{ width: "48%" }}>
                                    <fieldset >
                                        <legend>Trade Licence No</legend>
                                        <input type="text" id="licenceNo" name="licenceNo" value={formData.licenceNo} onChange={handleOnChange} placeholder="Enter Trade Licence No." />
                                    </fieldset>
                                </div>
                                <div style={{ width: "48%", left: "4%", position: "relative" }}>
                                    <fieldset >
                                        <legend>Trade Register Date</legend>
                                        <DatePicker
                                            dayPlaceholder="DD"
                                            monthPlaceholder='MM'
                                            yearPlaceholder='YYYY'
                                            value={formData.registerDate}
                                            selected={formData.registerDate}
                                            onChange={(date) => { setformData({ ...formData, registerDate: date }); handleOnChange() }}
                                            required={true}
                                            calendarIcon={null}
                                            clearIcon={null}
                                        />
                                    </fieldset>
                                </div>
                            </div>
                        </div>
                    </form>
                    <div className='org-form-left-bottom-div'>
                        <button onClick={handleNext}>{submitValue}</button>
                    </div>
                </div>
                <div className='org-form-left-Top-div'>
                    <div style={{ display: 'flex' }}>
                        {orgData && orgData.filename ? <FilePreviewerThumbnail file={{
                            url: process.env.REACT_APP_API_ENDPOINT + '/auth/getFile?name=/orgLogo/' + orgData.filename
                        }} /> : <div className='imgSpan'>
                        </div>
                        }
                        <div className='org-form-left-Top-div-btn'>
                            <Modal id={formData.id} orgData={orgData} setOrgdData={setOrgdData} Trigger_Button={<button style={{ color: '#2687D7' }} onClick={(e) => { e.preventDefault() }}>Change Logo</button>}></Modal>
                            <button onClick={() => deleteFile(orgData)}>Delete Logo</button>
                        </div>
                    </div>
                    <div style={{ textAlign: 'center', width: '6.51vw', paddingTop: "0.5vh" }}>Company Logo</div>
                </div>
            </div>

        </div>
    )
}
export default Organization