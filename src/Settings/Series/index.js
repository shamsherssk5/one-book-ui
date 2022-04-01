import axios from 'axios'
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import './seriesStyle.css'
export const Series = ({ setNext, setToken, actionName, setactionName, loading}) => {
    const [submitValue, setSubmitValue] = useState('Next');
    const [error, setError] = useState(false);
    let emptySeries={
        customersPrefix: "CUS-",
        customersSeries: "0001",
        suppliersPrefix: "SUP-",
        suppliersSeries: "0001",
        inventoryPrefix: "INT-",
        inventorySeries: "0001",
        materialPrefix: "MAT-",
        materialSeries: "0001",
        tasksPrefix: "TAS-",
        tasksSeries: "0001",
        estimationPrefix: "EST-",
        estimationSeries: "0001",
    }
    const [formData, setformData] = useState(emptySeries);
    

    useEffect(async () => {
        let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
        if (actionName !== "Series") return;
        if (formData.id) return;
        if (currentUser && currentUser.orgID === 0) {
            setformData(emptySeries);
            alert("Please Update Organization");
            setactionName("Organization");
            return;
        } else {
            loading({ visibility: true, message: "Loading Series..." });
            await axios.get(process.env.REACT_APP_API_ENDPOINT + '/settings/getSeries?ID=' + currentUser.orgID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                .then((res) => {
                    if (res.data.error) {
                        setToken(undefined);
                    }

                    if (res.data.length > 0) {
                        setformData(res.data[0]);
                    } else {
                        setformData(emptySeries);
                    }
                    loading({ visibility: false });

                }).catch((err) => {
                    console.log(err);
                    loading({ visibility: false });
                })
        }
    }, [actionName]);


    const handleOnChange = (e) => {
        if (e) setformData(prev => ({ ...prev, [e.target.id]: e.target.value }));

        if (formData.id) {
            setSubmitValue("Update");
        } else {
            setSubmitValue("Save");
        }
    }
    const formValidation = () => {
        return Object.keys(formData).some((key) => { console.log(key + "-" + formData[key]); return formData[key].toString().trim().length == 0 });
    }
    const handleNext = async (e) => {

        e.preventDefault();
        let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
        if (submitValue === "Next") {
            setNext();
            return;
        }
        if (formValidation()) {
            setError("Please fill out all the mandatory fields");
            return;
        } else {
            setError(undefined);
            if (submitValue === "Update") {
                setSubmitValue("...Updating");
                await axios.post(process.env.REACT_APP_API_ENDPOINT + '/settings/updateSeries', formData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                    .then((res) => {
                        if (res.data.error) {
                            setToken(undefined);
                        }
                        toast.success('Series data updated Sucessfully');
                        setSubmitValue("Next");
                    })
                    .catch(err => {
                        console.log(error);
                        toast.error("Series updation Failed");
                        setSubmitValue("Next");
                    })

            } else {
                setSubmitValue("...Saving");
                await axios.post(process.env.REACT_APP_API_ENDPOINT + '/settings/createSeries?orgID=' + currentUser.orgID, formData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                    .then((res) => {
                        if (res.data.error) {
                            setToken(undefined);
                        }

                        setformData(prev => ({ ...prev, 'id': res.data.id }));
                        toast.success('Series data saved Sucessfully');
                        setSubmitValue("Next");
                    })
                    .catch(err => {
                        console.log(error);
                        toast.error("Series creation Failed");
                        setSubmitValue("Next");
                    })
            }
        };
        
     }
    return (
        actionName === "Series" &&
        <div id="series">
            <div class="series-main-container create-task-container">
                <form id="series-entry-Form" name="series" autoComplete='off' noValidate >
                {error ? <div>
                        <span style={{ fontSize: "0.73vw", color: "red" }} >{error} </span>
                    </div> : ''}
                    <div className='series-entry-div'>
                        <div style={{ display: "flex"}}>
                            <fieldset style={{ width: '100%', marginLeft: '0' }}>
                                <legend>Customers Prefix* </legend>
                                <input type="text" id="customersPrefix" name="customersPrefix" value={formData.customersPrefix} onChange={handleOnChange} style={{ color: '#353A42' }} />
                            </fieldset>
                            <fieldset style={{ width: '100%', marginLeft: '1vw', display: 'flex', paddingRight: '0.95vw' }}>
                                <legend>Customers Series </legend>
                                <input type="text" id="customersSeries" name="customersSeries" value={formData.customersSeries} onChange={handleOnChange} style={{ color: '#C4C4C4' }} />

                            </fieldset>
                        </div>
                        <div style={{ display: "flex"}}>
                            <fieldset style={{ width: '100%', marginLeft: '0' }}>
                                <legend>Suppliers Prefix* </legend>
                                <input type="text" id="suppliersPrefix" name="suppliersPrefix" value={formData.suppliersPrefix} onChange={handleOnChange} style={{ color: '#353A42' }} />
                            </fieldset>
                            <fieldset style={{ width: '100%', marginLeft: '1vw', display: 'flex', paddingRight: '0.95vw' }}>
                                <legend>Suppliers Series </legend>
                                <input type="text" id="suppliersSeries" name="suppliersSeries" value={formData.suppliersSeries} onChange={handleOnChange} style={{ color: '#C4C4C4' }} />
                            </fieldset>
                        </div>
                        <div style={{ display: "flex"}}>
                            <fieldset style={{ width: '100%', marginLeft: '0' }}>
                                <legend>Inventory Prefix* </legend>
                                <input type="text" id="inventoryPrefix" name="inventoryPrefix" value={formData.inventoryPrefix} onChange={handleOnChange} style={{ color: '#353A42' }} />
                            </fieldset>
                            <fieldset style={{ width: '100%', marginLeft: '1vw', display: 'flex', paddingRight: '0.95vw' }}>
                                <legend>Inventory Series </legend>
                                <input type="text" id="inventorySeries" name="inventorySeries" value={formData.inventorySeries} onChange={handleOnChange} style={{ color: '#C4C4C4' }}/>
                            </fieldset>
                        </div>
                        <div style={{ display: "flex"}}>
                            <fieldset style={{ width: '100%', marginLeft: '0' }}>
                                <legend>Material & Products Prefix* </legend>
                                <input type="text" id="materialPrefix" name="materialPrefix" value={formData.materialPrefix} onChange={handleOnChange} style={{ color: '#353A42' }} />
                            </fieldset>
                            <fieldset style={{ width: '100%', marginLeft: '1vw', display: 'flex', paddingRight: '0.95vw' }}>
                                <legend>Material & Products Series </legend>
                                <input type="text" id="materialSeries" name="materialSeries" value={formData.materialSeries} onChange={handleOnChange} style={{ color: '#C4C4C4' }}/>
                            </fieldset>
                        </div>
                        <div style={{ display: "flex"}}>
                            <fieldset style={{ width: '100%', marginLeft: '0' }}>
                                <legend>Tasks Prefix* </legend>
                                <input type="text" id="tasksPrefix" name="tasksPrefix" value={formData.tasksPrefix} onChange={handleOnChange} style={{ color: '#353A42' }} />
                            </fieldset>
                            <fieldset style={{ width: '100%', marginLeft: '1vw', display: 'flex', paddingRight: '0.95vw' }}>
                                <legend>Tasks Series </legend>
                                <input type="text" id="tasksSeries" name="tasksSeries" value={formData.tasksSeries} onChange={handleOnChange} style={{ color: '#C4C4C4' }} />
                            </fieldset>
                        </div>
                        <div style={{ display: "flex"}}>
                            <fieldset style={{ width: '100%', marginLeft: '0' }}>
                                <legend>Estimation Prefix* </legend>
                                <input type="text" id="estimationPrefix" name="estimationPrefix" value={formData.estimationPrefix} onChange={handleOnChange} style={{ color: '#353A42' }} />
                            </fieldset>
                            <fieldset style={{ width: '100%', marginLeft: '1vw', display: 'flex', paddingRight: '0.95vw' }}>
                                <legend>Estimation Series </legend>
                                <input type="text" id="estimationSeries" name="estimationSeries" value={formData.estimationSeries} onChange={handleOnChange} style={{ color: '#C4C4C4' }} />
                            </fieldset>
                        </div>
                        <div className='series-form-entry-bottom-div'>
                            <button id="next" onClick={handleNext}>{submitValue}</button>
                        </div>
                    </div>

                </form>

            </div>

        </div>
    )
}