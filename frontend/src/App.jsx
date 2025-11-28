import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TableViewer from './TableViewer';
import EmployeeCrud from './EmployeeCrud';
import Dashboard from './Dashboard';
import AboutModal from './AboutModal';
import SystemInfo from './SystemInfo';
import './App.css';

function App() {
  const [dbConnected, setDbConnected] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [password, setPassword] = useState('');
  const [employees, setEmployees] = useState([]); // Shared state for dashboard

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    checkConnection();
    // Poll connection status every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    // Check Backend Health
    try {
      await axios.get(`${apiUrl}/health`);
      setBackendConnected(true);
    } catch (err) {
      setBackendConnected(false);
      setDbConnected(false); // If backend is down, DB is unreachable via API
      return;
    }

    // Check DB Connection
    try {
      const res = await axios.get(`${apiUrl}/status`);
      setDbConnected(res.data.connected);
    } catch (err) {
      setDbConnected(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/login`, { password });
      if (res.data.success) {
        setIsAdmin(true);
        setShowLogin(false);
      }
    } catch (err) {
      alert('Invalid password');
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
  };

  // Callback to update dashboard data when CRUD fetches
  const handleDataUpdate = (data) => {
    setEmployees(data);
  };

  return (
    <div className="App">
      <header className="glass-header">
        <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1>Pub400 Data Explorer</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className={`status-badge ${backendConnected ? 'connected' : 'disconnected'}`} title="Node.js API Status">
              {backendConnected ? '🟢 Backend' : '🔴 Backend'}
            </div>
            <div className={`status-badge ${dbConnected ? 'connected' : 'disconnected'}`} title="IBM i Database Status">
              {dbConnected ? '🟢 Pub400' : '🔴 Pub400'}
            </div>
          </div>
        </div>

        <div className="nav-buttons">
          <button
            className="btn-secondary"
            onClick={() => setShowAbout(true)}
          >
            ℹ️ About Demo
          </button>

          {isAdmin ? (
            <button onClick={handleLogout} className="btn-secondary">Logout (Admin)</button>
          ) : (
            <button onClick={() => setShowLogin(true)} className="btn-primary">Admin Login</button>
          )}
        </div>
      </header>

      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />

      {showLogin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          backdropFilter: 'blur(5px)'
        }}>
          <form onSubmit={handleLogin} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '300px', background: 'white' }}>
            <h3 style={{ textAlign: 'center' }}>Admin Access</h3>
            <input
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowLogin(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Login</button>
            </div>
          </form>
        </div>
      )}

      <main className="main-content">
        <SystemInfo />

        <div className="card">
          <Dashboard employees={employees} />
        </div>

        <div className="card" style={{ position: 'relative' }}>
          {!isAdmin && (
            <div style={{
              background: '#ebf8ff', borderLeft: '4px solid #3182ce', padding: '15px', marginBottom: '20px',
              borderRadius: '0 8px 8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <strong>👀 Read-Only Mode</strong>
                <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#2c5282' }}>
                  You are viewing live data from IBM i. Log in to enable Edit/Delete operations.
                </p>
              </div>
            </div>
          )}

          <div className="tooltip-container" style={{ width: '100%' }}>
            <EmployeeCrud isAdmin={isAdmin} password={password} onDataUpdate={handleDataUpdate} />
            <span className="tooltip-text">This component interacts directly with the DB2 database on the AS/400 server.</span>
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Legacy Data Viewer</h3>
          <TableViewer />
        </div>
      </main>

      <footer className="footer">
        <p>
          Developed by <a href="https://www.linkedin.com/in/mariano-franco-1975-mdq/" target="_blank" rel="noopener noreferrer">Mariano Franco</a>
          <br />
          Powered by React, Node.js, and IBM i
        </p>
      </footer>
    </div>
  );
}

export default App;

