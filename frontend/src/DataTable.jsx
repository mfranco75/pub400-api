import React, { useState, useMemo } from 'react';
import './DataTable.css';

const DataTable = ({ data, columns, actions, defaultSortField }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: defaultSortField || null, direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // 1. Filter Data
    const filteredData = useMemo(() => {
        if (!searchTerm) return data;

        const lowerTerm = searchTerm.toLowerCase();
        return data.filter(item =>
            Object.values(item).some(val =>
                String(val).toLowerCase().includes(lowerTerm)
            )
        );
    }, [data, searchTerm]);

    // 2. Sort Data
    const sortedData = useMemo(() => {
        let sortableItems = [...filteredData];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [filteredData, sortConfig]);

    // 3. Paginate Data
    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const currentData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * itemsPerPage;
        const lastPageIndex = firstPageIndex + itemsPerPage;
        return sortedData.slice(firstPageIndex, lastPageIndex);
    }, [sortedData, currentPage]);

    // Handlers
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    // Helper to get sort icon
    const getSortIcon = (name) => {
        if (sortConfig.key !== name) return '↕';
        return sortConfig.direction === 'ascending' ? '↑' : '↓';
    };

    if (!data || data.length === 0) {
        return <div className="no-data-message">No data available.</div>;
    }

    // Auto-generate columns if not provided
    const displayColumns = columns || Object.keys(data[0]).map(key => ({ key, label: key }));

    return (
        <div className="data-table-container">
            <div className="data-table-controls">
                <div className="search-input-wrapper">
                    <span className="search-icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <div className="table-stats">
                    Showing {filteredData.length} entries
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                    <thead>
                        <tr>
                            {displayColumns.map((col) => (
                                <th
                                    key={col.key}
                                    onClick={() => requestSort(col.key)}
                                    className="sortable"
                                >
                                    {col.label}
                                    <span className={`sort-icon ${sortConfig.key === col.key ? 'active' : ''}`}>
                                        {getSortIcon(col.key)}
                                    </span>
                                </th>
                            ))}
                            {actions && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map((item, index) => (
                            <tr key={index}>
                                {displayColumns.map((col) => (
                                    <td key={`${index}-${col.key}`}>
                                        {item[col.key]}
                                    </td>
                                ))}
                                {actions && (
                                    <td>
                                        {actions(item)}
                                    </td>
                                )}
                            </tr>
                        ))}
                        {currentData.length === 0 && (
                            <tr>
                                <td colSpan={displayColumns.length + (actions ? 1 : 0)} style={{ textAlign: 'center' }}>
                                    No matches found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="data-table-footer">
                    <div className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </div>
                    <div className="pagination-controls">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="pagination-btn"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="pagination-btn"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
