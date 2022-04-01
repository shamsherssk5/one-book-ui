import { faChevronLeft, faChevronRight, faEllipsisV } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios"
import React, { useEffect, useState } from "react"
import toast from "react-hot-toast"
import search_16px from '../../assets/images/search_16px.png'
import Warnning from "../Warnning"
import './approvalsStyle.css'
export const Approvals = ({actionName}) => {
    const [approvListData, setApprovListData] = useState({
        moduleList: [
            {
                id: 1,
                key: 'Quotes',
                value: 'Quotes',
                isselect: false
            },
            {
                id: 2,
                key: 'PurchaseOrder',
                value: 'Purchase Order',
                isselect: false
            }, {
                id: 3,
                key: 'MaterialRequests',
                value: 'Material Requests',
                isselect: false
            }, {
                id: 4,
                key: 'LeaveRequests',
                value: 'Leave Requests',
                isselect: false
            }, {
                id: 5,
                key: 'SalaryRequests',
                value: 'Salary Requests',
                isselect: false
            },
        ],
        expandModule: false,
        approvalTypes: [{
            id: 1,
            key: 'MultiPerson',
            value: 'Multi Person',
            isselect: false
        }, {
            id: 2,
            key: 'SignlePerson',
            value: 'Signle Person',
            isselect: false
        },],
        AuthorizedPersons: [],
        expandpeopele: false,
        aprrovalList: [],
        searchList: [],
        currentPage: 1,
        currentData: [],
        todosPerPage: 5,
        pageNumbers: 0,

    })
    const [expanded, setexpanded] = useState(false)
    const [canShowErrors, setCanShowErrors] = useState(false)
    const [approvData, setapprovData] = useState({ id: 0, modules: "", approvType: "", AuthorizedPerson: "" })
    const [displayDiv, setdisplayDiv] = useState(false)
    const [searchTxt, setsearchTxt] = useState("")
    const [isSearch, setisSearch] = useState(false)
    const [roleList, setroleList] = useState([
        {
            id: 1,
            text: "Admin",
            value: "Admin"
        },
        {
            id: 2,
            text: "General Manager",
            value: "General Manager"
        },
        {
            id: 3,
            text: "Production  Manager",
            value: "Production  Manager"
        },
        {
            id: 4,
            text: "Production Coordinator",
            value: "Production Coordinator"
        },
        {
            id: 5,
            text: "Estimator",
            value: "Estimator"
        },


    ])
    const [PrevDisable, setPrevDisable] = useState(true)
    const [NxtDisable, setNxtDisable] = useState(false);
    const [showWarning, setshowWarning] = useState(false)
    const [selectedId, setselectedId] = useState(0)
    useEffect(() => {
        getData()
    }, [])
    const getData = async () => {
        let users = []
        await axios.get('http://localhost:5000/approvals').then(async resp => {
            if (resp.status === 200) {
                const pageNumbers = Math.ceil(resp.data.length / approvListData.todosPerPage)
                const indexOfLastTodo = approvListData.currentPage * approvListData.todosPerPage;
                const indexOfFirstTodo = indexOfLastTodo - approvListData.todosPerPage;
                const currentTodos = resp.data.slice(indexOfFirstTodo, indexOfLastTodo);
                resp.data = resp.data.map(item => {
                    if (item.isShowMenu === true) {
                        item.isShowMenu = false
                    }
                    return item
                })
                await axios.get('http://localhost:5000/users').then(async resp1 => {
                    if (resp1.status === 200) {
                        users = resp1.data && resp1.data.map((item, index) => {
                            return {
                                id: item.id,
                                key: item.userName.replace(' ', ''),
                                value: item.userName,
                                isselect: false
                            }
                        });
                    }
                })
                setApprovListData({ ...approvListData, aprrovalList: resp.data, searchList: resp.data, pageNumbers: pageNumbers, currentData: currentTodos, AuthorizedPersons: users });

            }

        }).catch(error => {
            console.log(error);
        });
    }
    const setPegination = (CurrentPageNumber, data) => {
        if (data.length > 0) {

            const indexOfLastTodo = CurrentPageNumber * approvListData.todosPerPage;
            const indexOfFirstTodo = indexOfLastTodo - approvListData.todosPerPage;
            let currentTodos = []
            currentTodos = data.slice(indexOfFirstTodo, indexOfLastTodo);
            setApprovListData({ ...approvListData, currentData: currentTodos, currentPage: CurrentPageNumber });
        }
    }

    const handleOnChange = (e) => {
        setapprovData(prev => ({ ...prev, [e.target.id]: e.target.value }))
    }

    const handleNewBtn = () => {
        setdisplayDiv(!displayDiv);
    }

    const handleAddBtn = async (e, id) => {
        debugger
        e.preventDefault();
        if (formValidation()) {
            setCanShowErrors(true)
            return;
        } else { setCanShowErrors(false); }
        if (id === 0) {
            await axios.post('http://localhost:5000/approvals', approvData).then(async resp => {
                await getData()
            }).catch(error => {
                console.log(error);
            });
        }
        else {

            await axios.put(`http://localhost:5000/approvals/${id}/`, approvData)
                .then(async (response) => {
                    debugger
                    await getData()
                })
                .catch(error => {
                    console.error('There was an error!', error.message);
                });
        }
        setapprovData({ id: 0, modules: "", approvType: "", AuthorizedPerson: "" });
        toast.success('User data save Sucessfully', {
            duration: 4000,
            position: 'top-center', style: { marginTop: "1vw", background: "#fff", color: "green" }
        });
    }
    const formValidation = () => {
        return Object.keys(approvData).some((key) => { console.log(key + "-" + approvData[key]); return key === "lastLoginInfo" ? false : approvData[key].toString().trim().length == 0 });
    }
    const handleDelBtn = (id) => {
        setdisplayDiv(false)
    }
    const handleMenu = (id) => {

        setApprovListData({
            ...approvListData, aprrovalList: approvListData.aprrovalList.map((item) => {
                if (item.id === id) {
                    item.isShowMenu = !item.isShowMenu
                }
                else {
                    item.isShowMenu = false
                }
                return item;
            })
        });
    }
    const hanldeActionButton = (val) => {
        let CurrentPageNumber = 0;
        if (val === "Nxt") {
            CurrentPageNumber = approvListData.currentPage < approvListData.pageNumbers ? approvListData.currentPage + 1 : approvListData.currentPage
        }
        else if (val === "Pre") {
            CurrentPageNumber = approvListData.currentPage > 0 ? approvListData.currentPage - 1 : approvListData.currentPage;
        }
        else {
            CurrentPageNumber = approvListData.currentPage;
        }
        setPrevDisable(CurrentPageNumber === 1 ? true : false)
        setNxtDisable(CurrentPageNumber === approvListData.pageNumbers ? true : false)
        setPegination(CurrentPageNumber, approvListData.aprrovalList)
    }

    const handleEdit = (id) => {
        setdisplayDiv(true);
        let objdata = approvListData.aprrovalList.filter(v => v.id === id);
        console.log("objdata", objdata)
        if (objdata.length > 0) {
            setapprovData({
                id: objdata[0]["id"], modules: objdata[0]["modules"],
                approvType: objdata[0]["approvType"], AuthorizedPerson: objdata[0]["AuthorizedPerson"]
            });
            let mData = objdata[0]["modules"].split(",");
            console.log("modules data", mData.findIndex(mData => mData === 'Purchase Ordr'))
            let moduledata = approvListData.moduleList && approvListData.moduleList.map(
                item => {
                   if (mData.findIndex(mData => mData === item.value) !== -1) {
                        item.isselect = true
                    }
                    return item
                }
            )
            let sData = objdata[0]["AuthorizedPerson"].split(",");
            let AuthorizedPersonlist = approvListData.AuthorizedPersons && approvListData.AuthorizedPersons.map(
                item => {
                    if (sData.findIndex(sData => sData === item.value) !== -1) {
                        item.isselect = true
                    }
                    return item
                }
            )
            setApprovListData({ ...approvListData, moduleList: moduledata, AuthorizedPersons: AuthorizedPersonlist });
        }
    }

    const handleSearch = (e) => {
        let currentTodos = [];
        let pageNumbers = 0
        setsearchTxt(e.target.value)
        let arrData = approvListData.aprrovalList.filter(item => item.userName.toLowerCase().indexOf(e.target.value.toLowerCase()) !== -1);
        if (arrData.length > 0) {
            pageNumbers = Math.ceil(arrData.length / approvListData.todosPerPage)
            const indexOfLastTodo = 1 * approvListData.todosPerPage;
            const indexOfFirstTodo = indexOfLastTodo - approvListData.todosPerPage;
            currentTodos = arrData.slice(indexOfFirstTodo, indexOfLastTodo);
        }
        setApprovListData({ ...approvListData, searchList: arrData, currentData: currentTodos, currentPage: 1, pageNumbers: pageNumbers });
    }
    const handleshowWarning = (id) => {
        approvListData.aprrovalList.map((item, i) => {
            if (item.id === id) {
                item.isShowMenu = false
            }
            return item
        })
        setselectedId(id);
        setshowWarning(true);
    }
    const handleYes = async () => {
        await axios.delete(`http://localhost:5000/approvals/${selectedId}/`)
            .then(async (response) => {
               console.log("response", response)
                await setshowWarning(false)
                await getData();
            })
            .catch(error => {
                console.error('There was an error!', error.message);
            });
    }
    const handleModule = (e, id) => {
        let data = approvListData.moduleList && approvListData.moduleList.map(
            item => {
                if (item.id === id) {
                    item.isselect = !item.isselect
                }
                return item
            }
        )
        setApprovListData({ ...approvListData, moduleList: data });
        let filterdata = []

        if (data.filter(x => x.isselect === true)) {
            data.map(item => {
                if (item.isselect === true) {
                    filterdata.push(item.value)
                }
                return item
            });
            filterdata = filterdata.join(',');
        }

        setapprovData({ ...approvData, modules: filterdata })

    }
    const handlePerson = (e, id) => {
        let data = approvListData.AuthorizedPersons && approvListData.AuthorizedPersons.map(
            item => {
                if (item.id === id) {
                    item.isselect = !item.isselect
                }
                return item
            }
        )
        setApprovListData({ ...approvListData, AuthorizedPersons: data });

        let filterdata = []
        if (data.filter(x => x.isselect === true)) {
            data.map(item => {
                if (item.isselect === true) {
                    filterdata.push(item.value)
                }
                return item
            });
            filterdata = filterdata.join(',');
        }

        setapprovData({ ...approvData, AuthorizedPerson: filterdata })

    }
    console.log("approvData", approvData);
    console.log("State", approvListData)
    return (
    actionName === "Approvals" &&
    <div id="approvals">
        <div className="approvals-header-div">
            <div className="approvals-header-total-div">Current Approvals  ({approvListData.currentData && approvListData.currentData.length} Approval)</div>
            <div className="approvals-header-search-div">
                {isSearch && <input type="text" autoFocus value={searchTxt} placeholder="Search Here" onChange={(e) => handleSearch(e)} />}
                <img src={search_16px} alt="No Image" onClick={() => setisSearch(!isSearch)} style={{ padding: '0.5vw' }} />
            </div>
        </div>
        <div className="approvals-entry-div">
            <div className="approvals-entry-left-div" >  <button className='approvals-entry-new-Btn' onClick={handleNewBtn}>Assign Approvals</button></div>
            {displayDiv && <div className="approvals-entry-right-div">
                <fieldset >
                    <legend>Module</legend>
                    <div className="selectBox" onClick={() => setApprovListData({ ...approvListData, expandModule: !approvListData.expandModule })}>
                        <select>
                            <option>{approvData.modules.length > 0 ? approvData.modules : 'Select Module'} </option>
                        </select>
                        <div className="overSelect"></div>
                    </div>
                    {approvListData.expandModule &&
                        <div className='checkboxes'>
                            {approvListData.moduleList && approvListData.moduleList.map(
                                item => {
                                    return <label >
                                        <input checked={item.isselect || false} style={{ width: 'auto' }} type="checkbox" id={item.id} onClick={(e) => handleModule(e, item.id)} value={item.value} /><p>{item.value}</p></label>
                                }
                            )}
                        </div>
                    }
                </fieldset>
                <fieldset>
                    <legend>Approval Type</legend>
                    <select id="approvType" name="approvType" value={approvData.approvType} onChange={handleOnChange} >
                        <optgroup>
                            <option value="" disabled selected >Select Industry Types</option>
                            {approvListData.approvalTypes && approvListData.approvalTypes.map(
                                (item, i) => { return <option style={{ color: "#353e46" }} key={item.id} value={item.value}>{item.value}</option> }
                            )}
                        </optgroup>
                    </select>
                </fieldset>
                <fieldset >
                    <legend>Authorized Person</legend>
                    <div className="selectBox" onClick={() => setApprovListData({ ...approvListData, expandpeopele: !approvListData.expandpeopele })}>
                        <select>
                            <option>{approvData.AuthorizedPerson.length > 0 ? approvData.AuthorizedPerson : 'Select Authorized Person'} </option>
                        </select>
                        <div className="overSelect"></div>
                    </div>
                    {approvListData.expandpeopele &&
                        <div className='checkboxes'>
                            {approvListData.AuthorizedPersons && approvListData.AuthorizedPersons.map(
                                item => {
                                    return <label >
                                        <input checked={item.isselect || false} style={{ width: 'auto' }} type="checkbox" id={item.id} onClick={(e) => handlePerson(e, item.id)} value={item.value} /><p>{item.value}</p></label>
                                }
                            )}
                        </div>
                    }
                </fieldset>
                <button className='approvals-entry-add-btn' onClick={e => handleAddBtn(e, approvData.id)}>Add</button>
                <button className='approvals-entry-del-btn' onClick={handleDelBtn}><svg viewBox="0 0 50 50" width="16" height="16">
                    <path d="M25 2C12.309534 2 2 12.309534 2 25C2 37.690466 12.309534 48 25 48C37.690466 48 48 37.690466 48 25C48 12.309534 37.690466 2 25 2 z M 25 4C36.609534 4 46 13.390466 46 25C46 36.609534 36.609534 46 25 46C13.390466 46 4 36.609534 4 25C4 13.390466 13.390466 4 25 4 z M 32.990234 15.986328 A 1.0001 1.0001 0 0 0 32.292969 16.292969L25 23.585938L17.707031 16.292969 A 1.0001 1.0001 0 0 0 16.990234 15.990234 A 1.0001 1.0001 0 0 0 16.292969 17.707031L23.585938 25L16.292969 32.292969 A 1.0001 1.0001 0 1 0 17.707031 33.707031L25 26.414062L32.292969 33.707031 A 1.0001 1.0001 0 1 0 33.707031 32.292969L26.414062 25L33.707031 17.707031 A 1.0001 1.0001 0 0 0 32.990234 15.986328 z" fill="#5B5B5B" />
                </svg></button>
            </div>}
        </div>
        <div className="approvals-list-div">
            <table >
                <thead>
                    <tr className="approvals-list-table-header">
                        <th>Module</th>
                        <th>Authorized Approval Person</th>
                        <th>Approval Type</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {approvListData.currentData.map((item, i) => {
                        return (
                            <tr className="approvals-list-table-tr" key={i} >
                                <td style={{ display: 'none' }}>{item.id}</td>
                                <td style={{ fontWeight: '600', width: '40%' }}>{item.modules}</td>
                                <td style={{ width: '20%' }}>{item.approvType}</td>
                                <td style={{ width: '35%' }}>{item.AuthorizedPerson}</td>
                                <td style={{ width: '5%' }}>
                                    <div onClick={() => handleMenu(item.id)} className="approvals-list-table-option-btn" >
                                        <FontAwesomeIcon icon={faEllipsisV} size='xs' /></div>
                                    {item.isShowMenu && <ul className="approvals-list-table-option-menu">
                                        <li onClick={() => handleEdit(item.id)}>Edit</li>
                                        <li onClick={() => handleshowWarning(item.id)}>Delete </li>
                                    </ul>}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
        <div className="approvals-footer-main-div">
            <div className="approvals-footer-sub-div">
                <div className="approvals-footer-total">{approvListData.searchList.length} Users</div>
                <div className="approvals-footer-pagination-div">{approvListData.currentPage} of {approvListData.pageNumbers}</div>
                <div className="approvals-footer-btn-div">
                    <button disabled={PrevDisable} onClick={e => hanldeActionButton("Pre")}> <FontAwesomeIcon icon={faChevronLeft} /> Prev</button>
                    <vr />
                    <button disabled={NxtDisable} onClick={e => hanldeActionButton("Nxt")}>Next   <FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
            </div>
        </div>
        {showWarning && <Warnning bgColor='#F9F9F9' onNo={() => setshowWarning(false)} onYes={handleYes} message="are you Sure want to Delete ?" yesBtnName='Yes' noBtnName='No' />}
    </div>
    );
}