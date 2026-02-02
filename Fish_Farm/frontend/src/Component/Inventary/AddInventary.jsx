// Fish_Farm/frontend/src/Component/Inventary/AddInventary.jsx
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddInventary.css';

function AddInventary() {
    const history = useNavigate();
    const [inputs, setInputs] = useState({
        inventoryName: "",
        category: "",
        quantity: "",
        unit: "",
        reorder_level: "",
    });

    const handleChange = (e) => {
        setInputs((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await sendRequest();
            console.log("Inventory added:", res);
            history("/dashboard/Inventory/DisplayInventary");
        } catch (err) {
            console.error("Error adding inventory:", err);
        }
    };

    const sendRequest = async () => {
        return await axios.post("http://localhost:5000/Inventory", {
            inventoryName: String(inputs.inventoryName),
            category: String(inputs.category),
            quantity: Number(inputs.quantity),
            unit: String(inputs.unit),
            reorder_level: Number(inputs.reorder_level),
        }).then(res => res.data);
    };

    return (
        <div>
            <h1 className="O_A_I_header">Add Inventory</h1>
            <form onSubmit={handleSubmit}>
                <label>Inventory Name:</label>
                <input
                    type="text"
                    name="inventoryName"
                    value={inputs.inventoryName}
                    onChange={handleChange}
                    required
                />

                <label>Category (Task Type):</label>
                <select
                    name="category"
                    value={inputs.category}
                    onChange={handleChange}
                    required
                >
                    <option value="">Select Category</option>
                    <option value="Feeding">Feeding</option>
                    <option value="Cleaning Tanks">Cleaning Tanks</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Transferring Fish">Transferring Fish</option>
                    <option value="Check Water Quality">Check Water Quality</option>
                    <option value="Add Medicine">Add Medicine</option>
                </select>

                <label>Quantity:</label>
                <input
                    type="number"
                    name="quantity"
                    value={inputs.quantity}
                    onChange={handleChange}
                    required
                />

                <label>Unit:</label>
                <input
                    type="text"
                    name="unit"
                    value={inputs.unit}
                    onChange={handleChange}
                    required
                />

                <label>Reorder Level:</label>
                <input
                    type="number"
                    name="reorder_level"
                    value={inputs.reorder_level}
                    onChange={handleChange}
                    required
                />

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default AddInventary;
