//frontend/src/Component/EmployeeTask/ViewTask.jsx
import React, { useState ,useEffect} from 'react';
import axios from "axios";
import Task from '../EmployeeTask/Task';

const URL="http://localhost:5000/Tasks";

const fetchHandler = async()=>{
    return await axios.get(URL).then((res)=>res.data);

};

function ViewTask(){

    const[Tasks,setTasks]=useState();
    useEffect(()=>{
        fetchHandler().then((data)=>setTasks(data.Tasks))
    },[])


    return(
        <div>
           <h1>Task detail Display page</h1>
           <div>
            {Tasks &&Tasks.map((task,i)=>(
                <div key={i}>
                    <Task Task={task}/>
                    </div>
            ))};
           </div>



        </div>
    )
}

export default ViewTask;