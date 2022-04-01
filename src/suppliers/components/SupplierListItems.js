import axios from "axios";
import { useEffect, useState } from "react";
import Avatar from "react-avatar";
import toast from "react-hot-toast";
import { Country} from "country-state-city";
import moment from 'moment-timezone'
const SupplierListItems = ({ setToken,setRightContent, deleteTrigger,setDeleteTrigger,handleDeleteSelected,currentItems, addToMenu, setAddToMenu, setNoteClicked, updateData, setSelectedSubMenu, setHomeView, setCurrentCustomer, addNote }) => {
    const [sort, setSort] = useState('');
    let currentUser=JSON.parse(window.sessionStorage.getItem("currentUser"));
    useEffect(() => {
        if (currentItems == null) return;
        document.getElementById("all").checked = false;
        currentItems.forEach(element => {
            document.getElementById(element.supID).checked = false;
        });
    }, [currentItems])

    useEffect(() => {
        if (addNote) {
            let checkedItem = currentItems.filter(item => document.getElementById(item.supID).checked);
            if (checkedItem.length === 0) {
                toast.error("Please Select Customer Using Checkbox");
            } else if (checkedItem.length > 1) {
                toast.error("Please Select Only one Customer");
            } else {
                setHomeView("customerDetail");
                setRightContent("Company Info");
                setCurrentCustomer(checkedItem[0]);
                setSelectedSubMenu("Notes");
            }
            setNoteClicked();
        }
    }, [addNote])

    useEffect(async () => {
        if (addToMenu) {
            let checkedItem = currentItems.filter(item => document.getElementById(item.supID).checked);
            if (checkedItem.length === 0) {
                toast.error("Please Select atleast one Customer Using Checkbox");
                setAddToMenu();
            } else {
                let data={
                    supIDs:checkedItem.length===1?checkedItem.map(cust=>cust.supID)[0]:checkedItem.map(cust=>cust.supID).join(),
                    category:addToMenu
                }
                await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/update-supplier-category', data, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                    .then((res) => {
                        if (res.data.error) {
                            setToken(undefined);
                        }
                        updateData(prev => {
                            let updatedData = prev.filter(cust => {
                                if (checkedItem.includes(cust)) {
                                    cust.category = addToMenu;
                                }
                                return cust;
                            }
                            )
                            return updatedData;
                        })
                        setAddToMenu();
                        toast.success("Suppliers Moved Successfully");
                        document.body.click();
                    })
                    .catch((err) => {
                        console.log(err);
                        toast.error("Suppliers movement failed");
                        setAddToMenu();
                    })
            }
        }
    }, [addToMenu])


    useEffect(()=>{
        if(deleteTrigger){
            let checkedItem = currentItems.filter(item => document.getElementById(item.supID).checked);
            if (checkedItem.length === 0) {
                toast.error("Please Select atleast one Customer Using Checkbox");
                setDeleteTrigger();
            }else{
                let IDs=checkedItem.length===1?checkedItem.map(cust=>cust.supID)[0]:checkedItem.map(cust=>cust.supID).join();
                handleDeleteSelected(IDs);
                setDeleteTrigger();
            }
        }

    },[deleteTrigger])



    useEffect(() => {
        //sortData(sort);
    }, [sort])

    const handleOnchange = (e) => {
        let isAllChecked = currentItems.every(d => document.getElementById(d.supID).checked);
        if (isAllChecked) {
            document.getElementById("all").checked = true;
        } else {
            document.getElementById("all").checked = false;
        }
    }

    const handleCheckAll = (e) => {
        currentItems.forEach(element => {
            document.getElementById(element.supID).checked = e.target.checked;
        });
    }

    const handleCustomerClick = (e, cust) => {
        let className = e.target.className;
        if (className === 'chk-box-container-td' || className === 'chkbx') return;
        setHomeView("customerDetail");
        setRightContent("Company Info");
        setCurrentCustomer(cust)
    }

    return (
        <div className="list-container-box">
            {currentItems != null &&
                <div style={{ width: "100%", height: "100%", position: "relative" }}>
                    <table className="list-view-table">
                        <thead className="thead-class">
                            <tr className="list-view-header-row">
                                <th width="3.1%"><input id="all" className="chkbx" name="all" type="checkbox" onChange={handleCheckAll} /></th>
                                <th width="30.1%" >Customer Number & Name</th>
                                <th width="13.4%" >Business Type   </th>
                                <th width="15.9%">Email Accounts</th>
                                <th width="12.2%" >They owe you</th>
                                <th width="13.2%" >You owe them</th>
                                <th width="12.1%" >Create Date</th>
                            </tr>
                        </thead>
                        <tbody className="tbody-class">
                            {currentItems.map((cust, index) => {
                                return (<>
                                    <tr key={index} className="task-list-row-container" onClick={(e) => handleCustomerClick(e, cust)}>
                                        <td width="3.1%" className="chk-box-container-td"><input className="chkbx" name={cust.supID} id={cust.supID} type="checkbox" onChange={handleOnchange} /></td>
                                        <td idth="30.1%" className="ref-subject-container"><p>{cust.refText}{cust.refNum}</p><p className="list-subject">{cust.custName}</p><p>{Country.getCountryByCode(cust.country).name}</p></td>
                                        <td width="13.4%">{cust.businessType}</td>
                                        <td width="15.9%">{cust.emailAccounts}</td>
                                        <td width="12.2%" ></td>
                                        <td width="13.2%" ></td>
                                        <td width="12.1%" >{moment(cust.created_date).format(currentUser.dateFormat)}</td>
                                    </tr>
                                    <tr className="empty-row-container">
                                        <td width="100%" className="border-td" colSpan="8"><div></div></td>
                                    </tr>
                                </>)
                            })
                            }
                        </tbody>

                    </table>
                </div>
            }
        </div>
    );
}

export default SupplierListItems;