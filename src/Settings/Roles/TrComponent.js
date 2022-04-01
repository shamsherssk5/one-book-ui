import axios from 'axios';
import React, { useEffect, useState } from 'react';
import Open from "../../assets/images/next.png";

const TrComponent = ({ module, menu, setRolesMenu, setToken,roleId, loading }) => {
    const [openSubs, setOpenSubs] = useState(false);
    const [moduleAccess, setModuleAccess] = useState(false);
    useEffect(() => {
        checkMenuAccess();
    }, [module])

    const checkMenuAccess=()=>{
        let keys=Object.keys(module[0]).filter(key => key.startsWith("a_"));
        if (module[0].isClickable === 1) {
            setModuleAccess(keys.some(key => module[0][key] === 1));
        }else{
            let isAnyKey=false;
            for(let mod of module){
                if(keys.some(key => mod[key] === 1)){
                    setModuleAccess(true);
                    isAnyKey=true;
                    break;
                }

            }
            if(!isAnyKey){
                setModuleAccess(false);
                //setOpenSubs(false);
            }
        }
    }

    const menuAccessChange = (e) => {
        setModuleAccess(e.target.checked);
        setRolesMenu(prev =>{
            let updatedData=prev.filter(mod => {
                if(mod.menu === menu){
                    mod.a_create=moduleAccess?0:1;
                    mod.a_edit=moduleAccess?0:1;
                    mod.a_delete=moduleAccess?0:1;
                    mod.a_view_own=moduleAccess?0:1;
                    mod.a_view_all=moduleAccess?0:1;
                }
                return mod;
            })
            return updatedData;
        });  
        if(e.target.checked && module[0].isClickable === 0){
            setOpenSubs(true);
            createAccessRoleOneByOne();
        }else if(e.target.checked && module[0].isClickable === 1){
            createAccessRoleOneByOne();
        }else{
            setOpenSubs(false);
            resetDataInDB();
        }
    }

    const createAccessRoleOneByOne= ()=>{
       let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
       module.forEach(async modul => {
        loading({ visibility: true, message: "...Saving" });
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/settings/createAccessRoleOneByOne?orgID=' + currentUser.orgID+'&roleId='+roleId, {'m_id': modul.m_id}, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
        .then((res) => {
            if (res.data.error) {
                setToken(undefined);
            }
            setRolesMenu(prev =>{
                let updatedData=prev.filter(mod => {
                    if(mod.m_id === modul.m_id){
                        mod.r_id=res.data.insertId;
                    }
                    return mod;
                })
                return updatedData;    
                    
            });

            console.log('Roles data saved successfully');
            loading({ visibility: false});
        })
        .catch(err => {
            console.log(err);
            loading({ visibility: false});
        })             
       }); 
    }

    const handleCheckBoxChange=async (e, m_id,r_id, column)=>{
       if(r_id===null){
            loading({ visibility: true, message: "...Saving" });
       }

        setRolesMenu(prev =>{
            let updatedData=prev.filter(mod => {
                if(mod.m_id === m_id){
                    mod[column]=e.target.checked?1:0;
                }
                return mod;
            })
            return updatedData;
        });
        checkMenuAccess();
        let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
        let formData={};
        formData['column']=column;
        formData['columnValue']=e.target.checked;
        formData['roleId']=roleId;
        formData['r_id']=r_id;
        formData['m_id']=m_id;
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/settings/createAccessRole?orgID=' + currentUser.orgID, formData, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
                    .then((res) => {
                        if (res.data.error) {
                            setToken(undefined);
                        }
                        if(r_id===null){
                            setRolesMenu(prev =>{
                                let updatedData=prev.filter(mod => {
                                    if(mod.m_id === m_id){
                                        mod.r_id=res.data.insertId;
                                    }
                                    return mod;
                                })
                                return updatedData;
                                
                            });
                        }
                        console.log('Roles data saved successfully');
                        loading({ visibility: false});
                    })
                    .catch(err => {
                        console.log(err);
                        loading({ visibility: false});
                    })

    }

    const handleReset=async ()=>{

        setRolesMenu(prev =>{
            let updatedData=prev.filter(mod => {
                if(mod.menu === menu){
                    mod.a_create=0;
                    mod.a_edit=0;
                    mod.a_delete=0;
                    mod.a_view_own=0;
                    mod.a_view_all=0;
                }
                return mod;
            })
            return updatedData;
        });
        resetDataInDB();
    }

    const resetDataInDB=async ()=>{

        let currentUser = JSON.parse(window.sessionStorage.getItem("currentUser"));
        await axios.post(process.env.REACT_APP_API_ENDPOINT + '/settings/resetMenu?orgID=' + currentUser.orgID, {'menu':menu}, { headers: { "Authorization": window.sessionStorage.getItem("token") } })
        .then((res) => {
            if (res.data.error) {
                setToken(undefined);
            }
        })
        .catch(err => {
                console.log(err);
        })
    }


    return (
        <>
            <tr valign="middle" className='permission-table-body-row' style={module.subModules ? {} : { height: "4.8vh" }}>
                <td width="38%">
                    <div className='permissions-module-type-container'>
                        <div className='module-type-checkbox-container'>
                            <input className='input-checkkbox-permissions' type='checkbox' checked={moduleAccess} onChange={menuAccessChange} />
                        </div>
                        <div className='module-type-name-container'>
                            <img className="roles-module-open-close" style={openSubs ? { transform: "rotate(90deg)" } : {}} src={Open} onClick={() => { if (module[0].isClickable === 0) setOpenSubs(!openSubs) }} />
                            <span className='roles-module-name-text' style={openSubs ? { color: "#239BCF" } : {}}>
                                {menu}
                            </span>
                            <div className='submodules-container'>
                                {openSubs && module[0].isClickable === 0 &&
                                    module.map(menu => <p className='submodule-names'>{menu.submenu}</p>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </td>
                <td className='checkbox-holder' width="10.33%">{openSubs && module[0].isClickable === 0 ? module.map(menu => <p style={menu.m_create === 0 ? { visibility: "hidden" } : {}}><input onChange={(e)=>handleCheckBoxChange(e,menu.m_id,menu.r_id,'a_create')} className='input-checkkbox-permissions' type='checkbox' checked={menu.a_create === 1} /></p>) : module[0].isClickable === 1 && <input  onChange={(e)=>handleCheckBoxChange(e,module[0].m_id,module[0].r_id,'a_create')} className='input-checkkbox-permissions' type='checkbox' checked={module[0].a_create === 1} style={module[0].m_create === 0 ? { visibility: "hidden" } : {}} />}</td>
                <td className='checkbox-holder' width="10.33%">{openSubs && module[0].isClickable === 0 ? module.map(menu => <p style={menu.m_edit === 0 ? { visibility: "hidden" } : {}}><input onChange={(e)=>handleCheckBoxChange(e,menu.m_id,menu.r_id,'a_edit')} className='input-checkkbox-permissions' type='checkbox' checked={menu.a_edit === 1} /></p>) : module[0].isClickable === 1 && <input onChange={(e)=>handleCheckBoxChange(e,module[0].m_id,module[0].r_id,'a_edit')} className='input-checkkbox-permissions' type='checkbox' checked={module[0].a_edit === 1} style={module[0].m_edit === 0 ? { visibility: "hidden" } : {}} />}</td>
                <td className='checkbox-holder' width="10.33%">{openSubs && module[0].isClickable === 0 ? module.map(menu => <p style={menu.m_view_own === 0 ? { visibility: "hidden" } : {}}><input onChange={(e)=>handleCheckBoxChange(e,menu.m_id,menu.r_id,'a_view_own')} className='input-checkkbox-permissions' type='checkbox' checked={menu.a_view_own === 1} /></p>) : module[0].isClickable === 1 && <input onChange={(e)=>handleCheckBoxChange(e,module[0].m_id,module[0].r_id,'a_view_own')} className='input-checkkbox-permissions' type='checkbox' checked={module[0].a_view_own === 1} style={module[0].m_view_own === 0 ? { visibility: "hidden" } : {}} />}</td>
                <td className='checkbox-holder' width="10.33%">{openSubs && module[0].isClickable === 0 ? module.map(menu => <p style={menu.m_view_all === 0 ? { visibility: "hidden" } : {}}><input onChange={(e)=>handleCheckBoxChange(e,menu.m_id,menu.r_id,'a_view_all')} className='input-checkkbox-permissions' type='checkbox' checked={menu.a_view_all === 1} /></p>) : module[0].isClickable === 1 && <input onChange={(e)=>handleCheckBoxChange(e,module[0].m_id,module[0].r_id,'a_view_all')} className='input-checkkbox-permissions' type='checkbox' checked={module[0].a_view_all === 1} style={module[0].m_view_all === 0 ? { visibility: "hidden" } : {}} />}</td>
                <td className='checkbox-holder' width="10.33%">{openSubs && module[0].isClickable === 0 ? module.map(menu => <p style={menu.m_delete === 0 ? { visibility: "hidden" } : {}}><input onChange={(e)=>handleCheckBoxChange(e,menu.m_id,menu.r_id,'a_delete')} className='input-checkkbox-permissions' type='checkbox' checked={menu.a_delete === 1} /></p>) : module[0].isClickable === 1 && <input onChange={(e)=>handleCheckBoxChange(e,module[0].m_id,module[0].r_id,'a_delete')} className='input-checkkbox-permissions' type='checkbox' checked={module[0].a_delete === 1} style={module[0].m_delete === 0 ? { visibility: "hidden" } : {}} />}</td>
                <td width="10.33%" ><span className='permission-reset' onClick={handleReset}>Reset</span></td>
            </tr>
        </>
    );
};

export default TrComponent;