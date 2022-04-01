// import axios from 'axios';
// import 'bootstrap/dist/css/bootstrap.css';
// import React, { useEffect, useState } from 'react';
// import { OverlayTrigger, Popover } from 'react-bootstrap';
// import '../../css/maincontainer.css';
// import '../../css/scrollBar.scss'
// import CreateTask from '../create/CreateTask';
// import TaskCategory from './TaskCategory';
// import TaskDetails from './TaskDetails';

// const Tasks = () => {
//     let [data, setData] = useState({ tasks: [], rightContent: false, currentTask: {},category:'' });
//     let currentUser = {
//         "username": "Ram",
//         "id": 1234,
//         "avatarUrl": "pf1.jpg"
//     }

//     let taskContainer = ["To do", "Progress", "Hold", "Completed"];
//     const handleDeleteAll=()=>{
//         setData((prevState) => {
//             return { tasks: [], rightContent: prevState.rightContent, currentTask: null,category:prevState.category }
//         });
//     }
//     useEffect(() => {
//         axios.get('./data.json')
//             .then((res) => {
//                 taskContainer.forEach((category) => res.data.push({ "category": category }));
//                 setData({ tasks: res.data, rightContent: false, currentTask: res.data[0],category:'' });
//             }).catch((err) => {
//                 console.log(err);
//             })

//     }, []);

//     const showrightContent = (value, title) => {
//         setData((prevState) => {
//             return { tasks: prevState.tasks, rightContent: value, currentTask: prevState.currentTask,category:title }
//         });
//     }
//     const showTaskDetails = (task, e) => {
//         if (e.target.className.toString().includes('dots')) return;
//         setData((prevState) => {
//             return { tasks: prevState.tasks, rightContent: false, currentTask: task,category:prevState.category}
//         });
//     }

//     const onDrop = (e, category) => {
//         let id = e.dataTransfer.getData("id");
//         let task = data.tasks.filter((task) => task.id === id);
//         //axios.put((''),task[0]).then((response)=>{}).catch((error)=>{});
//         console.log( data.tasks);
//         let updatedData = data.tasks.filter((task) => {
//             if (task.id === id) {
//                 task.category = category;
//             }
//             return task;
//         });
//         setData((prevState) => {
//             return { tasks: updatedData, rightContent: prevState.rightContent, currentTask: task[0],category:prevState.category }
//         });

//     }
//     return (

//         <div className="maincontainer  myscrollbar">
//             <div className="tasksContainer">
//                 {/* <div className="taskHeaderContainer">
//                     <div className="tasks-heading">
//                         <p className="others-text">
//                             OTHERS
//                         </p>
//                         <p className="task-text-container">
//                             <button className='before-button'><span className="button-text">&#60;</span></button>
//                             <span className="task-text"> TASKS </span>
//                             <button className='plus-button' onClick={()=>{showrightContent(true,"To do")}}> <span className="button-text">&#43; </span> </button>
//                         </p>

//                     </div>
//                     <div className="options-heading-container">
//                         <p> <OverlayTrigger
//                             placement="bottom-end"
//                             trigger="click"
//                             rootClose
//                             overlay={(
//                                 <Popover>
//                                     <div className="popup">
//                                         <p> Edit Title</p>
//                                         <p>Edit Headlines</p>
//                                         <p> Task forward</p>
//                                         <p> Export</p>
//                                         <p> Import</p>
//                                         <p onClick={handleDeleteAll}> Delete All</p>
//                                     </div>
//                                 </Popover>
//                             )}>
//                             <button variant="success" className='options-button'>Options</button>
//                         </OverlayTrigger>
//                         </p>
//                         <p> <span className="search-text">&#9740;</span></p>
//                     </div>
//                 </div> */}
//                 <div className="taskCategoryContainer">
//                     {
//                         taskContainer.map(
//                             (container, index) => <TaskCategory setData={setData} onDrop={onDrop} handleTaskClick={showTaskDetails} key={index} showrightContent={showrightContent} headerTitle={container} tasks={data.tasks.filter((task) => task.category === container)} />)
//                     }
//                 </div>
//             </div>
//             <div className="create-details-container">
//                 {data.rightContent ?
//                     <CreateTask hide={data.rightContent} updateData={setData} currentUser={currentUser} category={data.category}/> :
//                     <TaskDetails style={{ display: 'none' }} taskData={data.currentTask} updateData={setData} currentUser={currentUser} />
//                 }
//             </div>

//         </div>
//     );

// };

// export default Tasks;