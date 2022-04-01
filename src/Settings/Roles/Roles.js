import React, { useEffect, useState } from 'react';
import './roles.css';
import Gr_Sr from "../../assets/images/gr_sr.png";
import Locked from "../../assets/images/Locked.png";
import toast from 'react-hot-toast';
import axios from 'axios';
import TrComponent from './TrComponent';

const Roles = ({ setNext, setToken, actionName, setactionName, loading, rolesList, setRolesList }) => {
    const [actualData, setActualData]=useState([]);
    
    const [newRole, setNewRole]=useState("");
    const [isSearchOpen, searchOpen] = useState(false);
    const [submitValue, setSubmitValue] = useState('Create Role');
    const [selectedRole, setSelectedRole]=useState({});
    const [rolesMenu, setRolesMenu]=useState([]);

    useEffect(async () => {
        if(rolesList.length<=0) return;
        let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
        if (actionName !== "Roles") return;
        if (currentUser && currentUser.orgID === 0) {
            setRolesMenu([]);
            alert("Please Update Organization");
            setactionName("Organization");
            return;
        } else {
            if(Object.keys(selectedRole).length === 0) setSelectedRole(rolesList[1]);
            loading({ visibility: true, message: "Loading Roles Menu..." });
            if(!selectedRole.id) return;
            setRolesMenu([]);
            searchOpen(false);
            await axios.get(process.env.REACT_APP_API_ENDPOINT + '/settings/rolesMenu?orgID=' + currentUser.orgID+'&roleID='+selectedRole.id, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                    .then((res) => {
                        if (res.data.error) {
                            setToken(undefined);
                        }
                        setRolesMenu(res.data);
                        loading({ visibility: false});
                    }).catch((err) => {
                        console.log(err);
                        loading({ visibility: false});
                    })
                }
    }, [rolesList, selectedRole,actionName])

    const addRole=async ()=>{
        if(newRole.length<=0){
            toast.error("please Enter Custome Role Name");
            return;
        }else{
            let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
            setSubmitValue("...Saving");
            await axios.post(process.env.REACT_APP_API_ENDPOINT + '/settings/addRole', {"role":newRole, "orgID":currentUser.orgID}, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                    .then((res) => {
                        if (res.data.error) {
                            setToken(undefined);
                        }
                        toast.success('Role Created Sucessfully');
                        let role={"id":res.data.id, "orgID":currentUser.orgID, name: newRole};
                        setRolesList([...rolesList, role])
                        setSubmitValue("Create Role");
                        setNewRole("");
                    })
                    .catch(err => {
                        console.log(err);
                        toast.error("Role Creation Failed");
                        setSubmitValue("Create Role");
                    })
        }
    }
    
    const handleSearchChange=(e)=>{
        if(e.target.value===undefined || e.target.value===""){setRolesMenu(actualData);return};
        let menuList=rolesMenu.filter(d=>d.submenu!==undefined && d.submenu.toLowerCase().includes(e.target.value.toLowerCase()));
        setRolesMenu(menuList);
    }

    const handKeyDown=(e)=>{
        if(e.key==="Backspace" || e.key==="Delete") setRolesMenu(actualData);
    }





    return (
        actionName === "Roles" &&
        <div className='roles-main-container'>
            <div className='roles-list-container'>
                <div className='roles-header-container'>
                    <span className='roles-header-text'>Roles List</span>
                </div>
                <div className='roles-list-create-container'>
                    <input className='custom-role-input' type='text'  value={newRole} placeholder='Enter Custom Role Name' maxLength={30} onChange={(e)=>setNewRole(e.target.value)}/>
                    <button className='save-button' onClick={()=>addRole()}>{submitValue}</button>
                </div>
                <div className='roles-list-table-container'>
                    <table width="100%">
                        <tbody>
                            {
                               (rolesList&&rolesList.length>0) && rolesList.map(role=><tr>
                                   <td className="role-td" textAlign="left" style={selectedRole.name===role.name?{color:"#239BCF", fontWeight:"bold"}:{}} onClick={()=>{if(role.name==="Admin")return;setSelectedRole(role)}}>{role.name}</td>
                                   <td textAlign="right" valign='top'>{role.name==="Admin" && <img className='locked' src={Locked}/>}</td>
                               </tr>)
                            }
                        </tbody>
                    </table>

                </div>

            </div>
            <div className='permissions-list-container'>
                <div className='roles-header-container'>
                    <div style={{ width: '50%', heigt: '100%', textAlign: 'left', position:'relative' }}>
                        <span className='roles-header-text'>Permissions ({selectedRole.name})</span>
                    </div>
                    <div style={{ width: '50%', heigt: '100%', textAlign: 'right' }}>
                        {!isSearchOpen && <img title="Search Task" className="left-gs-img search-button search-users" src={Gr_Sr} onClick={() => { searchOpen(true);setActualData(rolesMenu) }} />}
                        {isSearchOpen && <><input type="text" placeholder='Enter Module Name' className="search-button-text search-users" onChange={handleSearchChange} onKeyDown={handKeyDown} />
                            <span title="close Search" className="calendar-closee template search-users" onClick={() => { searchOpen(false); setRolesMenu(actualData) }}>
                                &#10006;
                            </span> </>}
                    </div>
                </div>
                <div className='permissions-type-container'>
                    <table className='permission-table'>
                        <thead>
                            <tr valign="middle" className='permission-table-header-row'>
                                <th  width="38%">Permissions</th>
                                <th  width="10.33%">Create</th>
                                <th  width="10.33%">Edit</th>
                                <th  width="10.33%">View Own</th>
                                <th  width="10.33%">View All</th>
                                <th  width="10.33%">Delete</th>
                                <th  width="10.33%"></th>
                            </tr>
                        </thead>
                        <tbody className="tbody-class permission-tbody">
                            {
                                 rolesMenu.length>0 && [... new Set(rolesMenu.map(r=>r.menu))].map(menu=><TrComponent module={rolesMenu.filter(r=>r.menu===menu)} menu={menu} setRolesMenu={setRolesMenu} setToken={setToken} roleId={selectedRole.id} loading={loading}/>)
                            }
                        </tbody>
                    </table>

                </div>

            </div>
            
        </div>
    );
};

export default Roles;