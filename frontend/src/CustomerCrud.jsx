import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerCrud.css';

const CustomerCrud = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        CUSNUM: '',
        LSTNAM: '',
        INIT: '',
        STREET: '',
        CITY: '',
        STATE: '',
        ZIPCOD: '',
        CDTLMT: 0,
        CHGCOD: 1,
        BALDUE: 0,
        CDTDUE: 0
    });

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/customers`);
            setCustomers(response.data);
        } catch (err) {
            setError('Failed to fetch customers');
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
                await axios.put(`${apiUrl}/customers/${formData.CUSNUM}`, formData);
            } else {
                await axios.post(`${apiUrl}/customers`, formData);
            }
            fetchCustomers();
            resetForm();
        } catch (err) {
            setError('Operation failed');
            console.error(err);
        }
    };

    const handleEdit = (customer) => {
        setFormData(customer);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this customer?')) return;
        try {
            await axios.delete(`${apiUrl}/customers/${id}`);
            fetchCustomers();
        } catch (err) {
            setError('Delete failed');
            console.error(err);
        }
    };

    const resetForm = () => {
        setFormData({
            CUSNUM: '', LSTNAM: '', INIT: '', STREET: '', CITY: '', STATE: '', ZIPCOD: '', CDTLMT: 0, CHGCOD: 1, BALDUE: 0, CDTDUE: 0
        });
        setIsEditing(false);
    };

    return (
        <div className="crud-container">
            <h2>Customer Management (QCUSTCDT)</h2>

            {error && <div className="error">{error}</div>}

            <form onSubmit={handleSubmit} className="crud-form">
                <div className="form-grid">
                    <input name="CUSNUM" placeholder="Customer #" value={formData.CUSNUM} onChange={handleInputChange} required disabled={isEditing} type="number" />
                    <input name="LSTNAM" placeholder="Last Name" value={formData.LSTNAM} onChange={handleInputChange} required />
                    <input name="INIT" placeholder="Initials" value={formData.INIT} onChange={handleInputChange} />
                    <input name="STREET" placeholder="Street" value={formData.STREET} onChange={handleInputChange} />
                    <input name="CITY" placeholder="City" value={formData.CITY} onChange={handleInputChange} />
                    <input name="STATE" placeholder="State" value={formData.STATE} onChange={handleInputChange} maxLength="2" />
                    <input name="ZIPCOD" placeholder="Zip Code" value={formData.ZIPCOD} onChange={handleInputChange} type="number" />
                    <input name="CDTLMT" placeholder="Credit Limit" value={formData.CDTLMT} onChange={handleInputChange} type="number" />
                    <input name="BALDUE" placeholder="Balance Due" value={formData.BALDUE} onChange={handleInputChange} type="number" />
                </div>
                <div className="form-actions">
                    <button type="submit" className="btn-primary">{isEditing ? 'Update' : 'Add'} Customer</button>
                    {isEditing && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
                </div>
            </form>

            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>City</th>
                            <th>State</th>
                            <th>Balance</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((cust) => (
                            <tr key={cust.CUSNUM}>
                                <td>{cust.CUSNUM}</td>
                                <td>{cust.LSTNAM}, {cust.INIT}</td>
                                <td>{cust.CITY}</td>
                                <td>{cust.STATE}</td>
                                <td>{cust.BALDUE}</td>
                                <td>
                                    <button onClick={() => handleEdit(cust)} className="btn-small">Edit</button>
                                    <button onClick={() => handleDelete(cust.CUSNUM)} className="btn-small btn-danger">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default CustomerCrud;
