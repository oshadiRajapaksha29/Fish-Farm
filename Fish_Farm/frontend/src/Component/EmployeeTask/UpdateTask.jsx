//fish farm/frontend/src/Component/EmployeeTask/UpdateTask.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "./UpdateTask.css";

function UpdateTask() {
  const [inputs, setInputs] = useState({
    taskName: "",
    description: "",
    employeeId: "",
    dueDate: "",
  });
  const [employees, setEmployees] = useState([]);
  const history = useNavigate();
  const { id } = useParams();

  // fetch task data
  useEffect(() => {
    const fetchTask = async () => {
      await axios
        .get(`http://localhost:5000/Tasks/${id}`)
        .then((res) => res.data)
        .then((data) => {
          const t = data.tasks || {};
          // ensure the date fits <input type="date">
          const yyyyMmDd = t.dueDate ? String(t.dueDate).slice(0, 10) : "";
          setInputs({
            taskName: t.taskName || "",
            description: t.description || "",
            employeeId: t.employeeId || "",
            dueDate: yyyyMmDd,
          });
        });
    };
    fetchTask();
  }, [id]);

  // fetch employees for dropdown
  useEffect(() => {
    axios
      .get("http://localhost:5000/admin/employees")
      .then((res) => setEmployees(res.data.employees || []))
      .catch((err) => console.log(err));
  }, []);

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const sendRequest = async () => {
    await axios
      .put(`http://localhost:5000/Tasks/${id}`, {
        taskName: String(inputs.taskName),
        description: String(inputs.description),
        employeeId: inputs.employeeId,
        dueDate: inputs.dueDate,
      })
      .then((res) => res.data);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest()
      .then(() => {
        // Show a success message
        alert("Task updated successfully!");
        // After a short delay, navigate back to the ViewTask page
        setTimeout(() => {
          history('/dashboard/EmployeeTask/ViewTask');
        }, 1500); // Delay navigation to allow user to see the message
      })
      .catch((err) => {
        console.error("Error updating task:", err);
        alert("Error updating task. Please try again.");
      });
  };

  return (
    <div className="O_U_T_section">
      <h1 className="O_U_T_task">Update task</h1>

      <form onSubmit={handleSubmit} className="O_U_T_form">
        <label className="O_U_T_label">Task:</label>
        <select
          className="O_U_T_name"
          name="taskName"
          onChange={handleChange}
          value={inputs.taskName}
        >
          <option value="">Select Task</option>
          <option value="Feeding">Feeding</option>
          <option value="Cleaning Tanks">Cleaning Tanks</option>
          <option value="Packaging">Packaging</option>
          <option value="Transferring Fish">Transferring Fish</option>
        </select>

        <label className="O_U_T_label">Employee:</label>
        <select
          className="O_U_T_name"
          name="employeeId"
          onChange={handleChange}
          value={inputs.employeeId}
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp._id} value={emp._id}>
              {emp.name}
            </option>
          ))}
        </select>

        <label className="O_U_T_label">Description:</label>
        <textarea
          className="O_U_T_description"
          name="description"
          onChange={handleChange}
          value={inputs.description}
          placeholder="Task details..."
        />

        <label className="O_U_T_label">Due Date</label>
        <input
          className="O_U_T_date"
          type="date"
          name="dueDate"
          onChange={handleChange}
          value={inputs.dueDate}
        />

        <button className="O_U_T_button" type="submit">
          Update Task
        </button>
      </form>
    </div>
  );
}

export default UpdateTask;
