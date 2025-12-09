import React, { useState } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import './TableViewer.css';

const TableViewer = () => {
    const [library, setLibrary] = useState('');
    const [table, setTable] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async (e) => {
        e.preventDefault();
        if (!library || !table) return;

        setLoading(true);
        setError(null);
        setData([]);

        try {
            // Use environment variable for API URL or default to localhost
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const response = await axios.get(`${apiUrl}/tables/${library}/${table}`);
            setData(response.data);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError(err.response?.data?.error || err.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="table-viewer">
            <h2>IBM i Table Viewer</h2>
            <form onSubmit={fetchData} className="search-form">
                <div className="form-group">
                    <label htmlFor="library">Library:</label>
                    <input
                        id="library"
                        type="text"
                        value={library}
                        onChange={(e) => setLibrary(e.target.value.toUpperCase())}
                        placeholder="e.g., QIWS"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="table">Table:</label>
                    <input
                        id="table"
                        type="text"
                        value={table}
                        onChange={(e) => setTable(e.target.value.toUpperCase())}
                        placeholder="e.g., QCUSTCDT"
                    />
                </div>
                <button type="submit" disabled={loading}>
                    {loading ? 'Loading...' : 'Fetch Data'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {data.length > 0 && (
                <div className="table-container">
                    <DataTable data={data} />
                </div>
            )}

            {!loading && !error && data.length === 0 && (
                <p className="no-data">No data to display. Enter a library and table name.</p>
            )}
        </div>
    );
};

export default TableViewer;
