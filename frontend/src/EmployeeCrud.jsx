import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import './CustomerCrud.css'; // Reusing the same CSS

const EmployeeCrud = ({ isAdmin, password, onDataUpdate }) => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        EMPID: '',
        EMPNAME: '',
        EMPCITY: '',
        EMPSTATE: ''
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    // Auth header helper
    const authConfig = {
        headers: { 'x-admin-password': password }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/employees?t=${new Date().getTime()}`);
            setEmployees(response.data);
            if (onDataUpdate) onDataUpdate(response.data);
        } catch (err) {
            setError('Failed to fetch employees');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axios.put(`${apiUrl}/employees/${formData.EMPID}`, formData, authConfig);
            } else {
                await axios.post(`${apiUrl}/employees`, formData, authConfig);
            }
            fetchEmployees();
            resetForm();
        } catch (err) {
            setError('Operation failed: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    const handleEdit = (employee) => {
        setFormData(employee);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this employee?')) return;
        try {
            await axios.delete(`${apiUrl}/employees/${id}`, authConfig);
            fetchEmployees();
        } catch (err) {
            setError('Delete failed: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            EMPID: '', EMPNAME: '', EMPCITY: '', EMPSTATE: ''
        });
        setIsEditing(false);
    };

    const handleExport = () => {
        const ws = XLSX.utils.json_to_sheet(employees);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Employees");
        XLSX.writeFile(wb, "employees_EMPPF1.xlsx");
    };

    return (
        <div className="crud-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Employee Management (EMPPF1)</h2>
                <div>
                    <button onClick={handleExport} className="btn-secondary" style={{ marginRight: '10px' }}>Download Excel</button>
                    {loading && <span style={{ color: '#666' }}>Loading...</span>}
                </div>
            </div>

            {error && <div className="error">{error}</div>}

            {isAdmin && (
                <form onSubmit={handleSubmit} className="crud-form">
                    <div className="form-grid">
                        <input name="EMPID" placeholder="ID" value={formData.EMPID} onChange={handleInputChange} required disabled={isEditing} type="number" />
                        <input name="EMPNAME" placeholder="Name" value={formData.EMPNAME} onChange={handleInputChange} required />
                        <input name="EMPCITY" placeholder="City" value={formData.EMPCITY} onChange={handleInputChange} />
                        <input name="EMPSTATE" placeholder="State" value={formData.EMPSTATE} onChange={handleInputChange} />
                    </div>
                    <div className="form-actions">
                        <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Add'} Employee</button>
                        {isEditing && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
                    </div>
                </form>
            )}

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>City</th>
                            <th>State</th>
                            {isAdmin && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((emp) => (
                            <tr key={emp.EMPID}>
                                <td>{emp.EMPID}</td>
                                <td>{emp.EMPNAME}</td>
                                <td>{emp.EMPCITY}</td>
                                <td>{emp.EMPSTATE}</td>
                                {isAdmin && (
                                    <td>
                                        <button onClick={() => handleEdit(emp)} className="btn-small">Edit</button>
                                        <button onClick={() => handleDelete(emp.EMPID)} className="btn-small btn-danger">Delete</button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EmployeeCrud;
