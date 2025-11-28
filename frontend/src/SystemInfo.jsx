import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SystemInfo.css';

const SystemInfo = () => {
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('checking'); // 'connected', 'disconnected', 'checking'

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    useEffect(() => {
        const fetchInfo = async () => {
            try {
                const res = await axios.get(`${apiUrl}/system-info`);
                setInfo(res.data);
                setConnectionStatus('connected');
                setError(null);
            } catch (err) {
                console.error("Failed to fetch system info", err);
                setConnectionStatus('disconnected');
                // Don't clear info immediately so we can show stale data if desired, 
                // but for now let's keep the error behavior or just show a disconnected badge
            } finally {
                setLoading(false);
            }
        };

        fetchInfo();
        // Refresh every 5 seconds for "real-time" feel
        const interval = setInterval(fetchInfo, 60000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="system-info-card loading">Loading System Info...</div>;

    // We render the card even if there is an error/disconnection to show the status
    if (error && !info) return <div className="system-info-card error">{error}</div>;
    if (!info && connectionStatus === 'disconnected') return (
        <div className="system-info-card error">
            <div className="status-indicator disconnected"></div>
            Server Disconnected. Retrying...
        </div>
    );
    if (!info) return null;

    const { user, spool } = info;

    // Format bytes to MB/GB
    const formatBytes = (bytes) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className={`system-info-card ${connectionStatus}`}>
            <div className="card-header">
                <h3>🖥️ Pub400 System Status</h3>
                <div className={`status-badge ${connectionStatus}`} title={connectionStatus === 'connected' ? 'Server Online' : 'Server Offline'}>
                    <span className="status-dot"></span>
                    {connectionStatus === 'connected' ? 'Online' : 'Offline'}
                </div>
            </div>

            <div className="info-grid">
                <div className="info-item">
                    <span className="label">User:</span>
                    <span className="value">{user.AUTHORIZATION_NAME}</span>
                </div>
                <div className="info-item">
                    <span className="label">Storage Used:</span>
                    <span className="value">{formatBytes(user.STORAGE_USED)}</span>
                </div>
                <div className="info-item">
                    <span className="label">Last Signon:</span>
                    <span className="value">{new Date(user.PREVIOUS_SIGNON).toLocaleString()}</span>
                </div>
            </div>

            <div className="spool-section">
                <h4>📄 Recent Spool Files</h4>
                {spool && spool.length > 0 ? (
                    <ul className="spool-list">
                        {spool.map((file, idx) => (
                            <li key={idx} className="spool-item">
                                <span className="spool-name">{file.SPOOLED_FILE_NAME}</span>
                                <span className="spool-job">({file.JOB_NAME})</span>
                                <span className="spool-time">{new Date(file.CREATE_TIMESTAMP).toLocaleTimeString()}</span>

                                <div className="spool-tooltip">
                                    <strong>File #:</strong> {file.FILE_NUMBER}<br />
                                    <strong>Created:</strong> {new Date(file.CREATE_TIMESTAMP).toLocaleString()}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-spool">No recent spool files found.</p>
                )}
            </div>
        </div>
    );
};

export default SystemInfo;
