import React, { useEffect, useState } from 'react';
import G_plus from "../../assets/images/g_plus.png";
import Gr_Sr from "../../assets/images/gr_sr.png";
import Filter from "../../tasks/assets/filter.png";
import UnFilter from "../../tasks/assets/unfilter.png";
import "../styles/suppliersHome.css";
import BusinessTypes from './BusinessTypes';
import CreateContact from './CreateContact';
import Back_Button from '../../assets/images/back-button.png';
import Blocked_Image from '../../assets/images/blocked-image.png';
import CompnayInfo from '../../assets/images/componyInfo.png';
import Notes from './Notes';
import Reminders from './Reminders';
import axios from 'axios';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import toast from 'react-hot-toast';
import CreateSupplier from './CreateSupplier';
import SupplierDetails from './SupplierDetails';
import EditSupplier from './EditSupplier';
import SupplierPaginatedItems from './SupplierPaginatedItems';
const SuppliersHome = ({ setToken, loading }) => {
    let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
    const [itemsPerPage, setItemsPerPage] = useState(25);
    const [rightContent, setRightContent] = useState("Business Types");
    const [menuButton, setMenuButton] = useState("all");
    const [slectedSubMenu, setSelectedSubMenu] = useState("Summary");
    const [homeView, setHomeView] = useState("customersList");
    const [currentCustomer, setCurrentCustomer] = useState();
    const [originalData, setOriginalData] = useState();
    const [contacts, setContacts] = useState([]);
    const [addNote, setNoteClicked] = useState();
    const [addToMenu, setAddToMenu] = useState();
    const [industryType, setindustryType] = useState([]);
    let [data, setData] = useState([]);
    const [deleteTrigger, setDeleteTrigger] = useState();
    const handleBack = () => {
        setHomeView("customersList");
        setRightContent("Business Types")
        setCurrentCustomer();
    }

    useEffect(() => {
        if (originalData && originalData.length > 0)
            setData(originalData.filter(d => d.category === menuButton || menuButton === 'all'));
        else
            setData([]);

    }, [menuButton, originalData])

    useEffect(async () => {
        loading({ visibility: true, message: "Loading Suppliers..." });
        await axios.get(process.env.REACT_APP_API_ENDPOINT + '/suppliers/suppliers-list?orgID=' + currentUser.orgID, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setOriginalData(res.data);
                loading({ visibility: false });
            }).catch((err) => {
                console.log(err);
                loading({ visibility: false })
            })
    }, []);

    const handleAddToCudstomer = async () => {
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/add-to-customer?timeZone=' + currentUser.timeZone, { orgID: currentUser.orgID, supID: currentCustomer.supID, assignee: currentUser.username }, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                toast.success("Supplier added to Customer List");
                document.body.click();
            }).catch((err) => {
                console.log(err);
                toast.error("Addition to customer Failed");
            })
    }

    const handleSearchChange = (e) => {
        setOriginalData((prev) => {
            let updatedPhoneBook = prev.filter((p) =>
                p.custName
                    .toLowerCase()
                    .includes(e.target.value.toLowerCase())
            );
            return updatedPhoneBook;
        });
    };
    const handKeyDown = (e) => {
        if (e.key === "Backspace" || e.key === "Delete") setOriginalData(actualData);
    };
    const handleDeleteSelected = async (IDs) => {

        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/delete-supplier', { 'IDs': IDs }, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setOriginalData(prev => {
                    let updatedData = prev.filter(cust => !IDs.toString().split(",").includes(cust.supID.toString()))
                    return updatedData;
                })
                toast.success("Supplier(s) deleted Successfully");
                document.body.click();
                setHomeView("customersList");
                setRightContent("Business Types");
            })
            .catch((err) => {
                console.log(err);
                toast.error("Supplier(s) deletion failed");
            })

    }
    const handleAddToMenu = async (menu) => {
        let d = {
            supIDs: currentCustomer.supID,
            category: menu
        }
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/suppliers/update-supplier-category', d, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
            .then((res) => {
                if (res.data.error) {
                    setToken(undefined);
                }
                setOriginalData(prev => {
                    let updatedData = prev.filter(cust => {
                        if (cust.supID === currentCustomer.supID) {
                            cust.category = menu;
                        }
                        return cust;
                    }
                    )
                    return updatedData;
                })
                toast.success("Supplier Moved Successfully");
                document.body.click();
            })
            .catch((err) => {
                console.log(err);
                toast.error("Supplier movement failed");
            })
    }

    const [filtered, setFiltered] = useState(false);
    const [actualData, setActualData] = useState([]);
    const [isSearchOpen, searchOpen] = useState(false);
    let [filterView, openFilterview] = useState(false);
    return (
        <div className="main-left-right-div-container">
            <div className="main-left-div">
                <div className="left-div-header customers">
                    <img className='back-button-pic' src={Back_Button} onClick={handleBack} style={{ display: homeView === "customerDetail" ? "block" : "none" }} />
                    <span className="header-title-sub">PURCHASE</span>
                    <span className="header-title-main" >Suppliers</span>
                    <img className="g_plus customers" src={G_plus} onClick={() => setRightContent("Create")} style={{ display: homeView === "customersList" ? "block" : "none" }} />
                    <OverlayTrigger
                        placement="bottom-end"
                        trigger="click"
                        rootClose={true}
                        overlay={(
                            <Popover>
                                <div className="popup">
                                    {homeView === "customersList" &&
                                        <>
                                            <p onClick={() => { document.body.click(); setRightContent("Create") }} > Add New</p>
                                            <p onClick={() => { document.body.click(); setNoteClicked(true) }}>Add Note</p>
                                            <p onClick={() => { document.body.click(); }}>Merge Suppliers</p>
                                            <p onClick={() => { setAddToMenu(menuButton === "blackListed" ? "preferred" : "blackListed") }}>Add To {menuButton === "blackListed" ? 'Preferred' : 'Black List'}</p>
                                            <p onClick={() => document.body.click()}> Import</p>
                                            <p onClick={() => document.body.click()}> Exports</p>
                                            <p className="popup-danger" onClick={() => { setDeleteTrigger(true) }}> Delete</p>
                                        </>
                                    }
                                    {homeView === "customerDetail" &&
                                        <>
                                            <p onClick={() => { document.body.click(); setRightContent("Edit Company Info") }} >Edit Company Info</p>
                                            <p onClick={() => { handleAddToCudstomer() }}>Copy to Customer List</p>
                                            <p onClick={() => { handleAddToMenu(currentCustomer.category === "blackListed" ? "preferred" : "blackListed") }}>Add To {currentCustomer.category === "blackListed" ? 'Preferred' : 'Black List'}</p>
                                            <p className="popup-danger" onClick={() => { handleDeleteSelected(currentCustomer.supID) }}> Delete</p>
                                        </>
                                    }
                                </div>
                            </Popover>
                        )}>
                        <button variant="success" className='left-options-button'>Options</button>
                    </OverlayTrigger>

                </div>
                {homeView === "customersList" &&
                    <div className="left-div-content customers">
                        <div className='customers-button-container'>
                            <div className='customers-buttons'>
                                <div className='cust-head-empty' style={{ width: '6.7%' }} />
                                <div className={menuButton === 'all' ? 'cust-all active' : 'cust-all'} onClick={() => setMenuButton("all")}>
                                    <span className='cust-span-all'>All</span>
                                </div>
                                <div className='cust-preferred' onClick={() => setMenuButton("preferred")}>
                                    <div className={menuButton === 'preferred' ? 'cust-preffered-text active' : 'cust-preffered-text'}>
                                        <span className='cust-span-all but-text'>Preferred</span>
                                    </div>
                                    <div className={menuButton === 'preferred' ? 'cust-prefer-count active' : 'cust-prefer-count'}>
                                        {originalData && <span className='cust-span-all but-count'>{originalData.filter(d => d.category === "preferred").length}</span>}
                                    </div>
                                </div>
                                <div className='cust-blacklisted' onClick={() => setMenuButton("blackListed")}>
                                    <div className={menuButton === 'blackListed' ? 'cust-preffered-text active' : 'cust-preffered-text'}>
                                        <span className='cust-span-all but-text'>Black Listed</span>
                                    </div>
                                    <div className={menuButton === 'blackListed' ? 'cust-prefer-count active' : 'cust-prefer-count'}>
                                        {originalData && <span className='cust-span-all but-count'>{originalData.filter(d => d.category === "blackListed").length}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='customers-numbers-container'>
                            <span>{data.length} items, Amount owe you AED {data.map(d => parseInt(d.amount)).reduce((a, b) => a + b, 0)} </span>
                            {!isSearchOpen && (
                                <img
                                    title="Search Contact"
                                    className="left-gs-img customers search-button"
                                    src={Gr_Sr}
                                    onClick={() => {
                                        searchOpen(true);
                                        setActualData(originalData);
                                    }}
                                />
                            )}
                            {isSearchOpen && (
                                <>
                                    <input
                                        type="text"
                                        placeholder="Enter Supplier Company Name"
                                        className="search-button-text"
                                        onChange={handleSearchChange}
                                        onKeyDown={handKeyDown}
                                    />
                                    <small
                                        title="close Search"
                                        className="calendar-closee template"
                                        onClick={() => {
                                            searchOpen(false);
                                            setOriginalData(actualData);
                                        }}
                                    >
                                        &#10006;
                                    </small>
                                </>
                            )}
                            {!filtered && <img title="Filter" className="left-gs-img customers filter-button" src={UnFilter} onClick={() => { openFilterview(true); setActualData(data.tasks) }} />}
                            {filtered && <img title="Filter" className="left-gs-img customers filter-button" src={Filter} onClick={() => { openFilterview(true); setActualData(data.tasks) }} />}
                        </div>
                        <div className='customers-container'>
                            <SupplierPaginatedItems setToken={setToken} deleteTrigger={deleteTrigger} setDeleteTrigger={setDeleteTrigger} handleDeleteSelected={handleDeleteSelected} setRightContent={setRightContent} itemsPerPage={itemsPerPage} items={data} updateData={setOriginalData} setItemsPerPage={setItemsPerPage} setHomeView={setHomeView} setCurrentCustomer={setCurrentCustomer} addNote={addNote} setNoteClicked={setNoteClicked} setSelectedSubMenu={setSelectedSubMenu} addToMenu={addToMenu} setAddToMenu={setAddToMenu} />
                        </div>
                    </div>
                }
                {
                    homeView === "customerDetail" &&
                    <div className="left-div-content customers">
                        <div className='customers-button-container'>
                            {currentCustomer.category === "blackListed" && <img className='back-button-pic' src={Blocked_Image} style={{ top: "50%", transform: "translateY(-50%)", width: "1.38vw" }} />}
                            <span className='customer-name-header' >{currentCustomer.custName}</span>

                        </div>
                        <div className='customers-numbers-summar-container' style={{ borderBottom: "0.5px solid #239BCF" }}>
                            <div className='customer-summary-menu-container'>
                                {
                                    ['Summary', 'Purchases', 'Activities', 'Notes', 'Reminders'].map(menu =>
                                        <a class={slectedSubMenu === menu ? "customer-menu-link selected" : "customer-menu-link"} onClick={(e) => { e.preventDefault(); setSelectedSubMenu(menu) }}>{menu}</a>
                                    )
                                }
                            </div>

                        </div>
                        <div className='customer-summary-container'>
                            <Notes setToken={setToken} slectedSubMenu={slectedSubMenu} data={currentCustomer.notes} setData={setOriginalData} currentCustomer={currentCustomer} />
                            <Reminders setToken={setToken} slectedSubMenu={slectedSubMenu} data={currentCustomer.reminders} setData={setOriginalData} currentCustomer={currentCustomer} contacts={contacts} />
                        </div>
                    </div>
                }
            </div>
            <div className="main-right-div">
                <div className="right-div-header">
                    <span className="right-header-title">{rightContent === "CreateContact" ? "Create" : rightContent}</span>
                    {rightContent === "Company Info" && <img className='company-info' src={CompnayInfo} />}
                    {(rightContent === "Business Types" || rightContent === "Create" || rightContent === "CreateContact") && <span className={(rightContent === "Create" || rightContent === "Business Types") ? "right-sub-header-1 clicked" : "right-sub-header-1"} onClick={() => { if (rightContent === "Business Types") return; setRightContent("Create") }}>{rightContent === "Business Types" ? "Types" : "Company Info"}</span>}
                    {rightContent !== "Business Types" && (rightContent === "Create" || rightContent === "CreateContact") && <span className={rightContent === "CreateContact" ? "right-sub-header-2 clicked" : "right-sub-header-2"} onClick={() => setRightContent("CreateContact")}>Contacts</span>}
                </div>
                <div className="right-div-content">
                    <BusinessTypes rightContent={rightContent} data={data} />
                    <CreateSupplier setRightContent={setRightContent} industryType={industryType} setindustryType={setindustryType} TypesetToken={setToken} rightContent={rightContent} contacts={contacts} setData={setOriginalData} />
                    <CreateContact setToken={setToken} rightContent={rightContent} contacts={contacts} setContacts={setContacts} />
                    <SupplierDetails rightContent={rightContent} currentCustomer={currentCustomer} setData={setOriginalData} contacts={contacts} setContacts={setContacts} />
                    <EditSupplier setRightContent={setRightContent} industryType={industryType} setToken={setToken} contacts={contacts} rightContent={rightContent} currentCustomer={currentCustomer} setData={setOriginalData} />
                </div>
            </div>
        </div>
    );
};

export default SuppliersHome;