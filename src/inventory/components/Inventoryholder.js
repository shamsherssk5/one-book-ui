import React from 'react';
import InventoryDiscussion from './InventoryDiscussion';

const Inventoryholder = ({ rightContent, currentInventory, setData, setToken }) => {
    return (
        rightContent === "Discussions" &&
        <div className="task-details-box">
            <InventoryDiscussion rightContent={rightContent} currentInventory={currentInventory} setToken={setToken} setData={setData}/>
        </div>
    );
};

export default Inventoryholder;