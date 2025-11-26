import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TableViewer from './TableViewer';
import EmployeeCrud from './EmployeeCrud';
import Dashboard from './Dashboard';
import './App.css';

function App() {
  const [connected, setConnected] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
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
    try {
      const res = await axios.get(`${apiUrl}/status`);
      setConnected(res.data.connected);
    } catch (err) {
      setConnected(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${apiUrl}/login`, { password });
      if (res.data.success) {
        setIsAdmin(true);
        setShowLogin(false);
        // Store password in memory (or localStorage if you want persistence)
        // For this demo, we'll pass it down to EmployeeCrud
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
      <header className="App-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Pub400 Data Explorer</h1>
          <span style={{
            fontSize: '0.8rem',
            padding: '4px 8px',
            borderRadius: '12px',
            background: connected ? '#e6fffa' : '#fff5f5',
            color: connected ? '#047857' : '#c53030',
            border: `1px solid ${connected ? '#047857' : '#c53030'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}>
            {connected ? '🟢 Connected to Pub400' : '🔴 Disconnected'}
          </span>
        </div>

        <div>
          {isAdmin ? (
            <button onClick={handleLogout} style={{ background: '#4a5568', fontSize: '0.9rem' }}>Logout (Admin)</button>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ background: '#3182ce', fontSize: '0.9rem' }}>Admin Login</button>
          )}
        </div>
      </header>

      {showLogin && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleLogin} style={{ background: 'white', padding: '30px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '15px', minWidth: '300px' }}>
            <h3>Admin Access</h3>
            <input
              type="password"
              placeholder="Enter Password (admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ padding: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
            />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowLogin(false)} style={{ background: '#718096' }}>Cancel</button>
              <button type="submit" style={{ background: '#3182ce' }}>Login</button>
            </div>
          </form>
        </div>
      )}

      <main style={{ padding: '20px' }}>

        <Dashboard employees={employees} />

        <div style={{ position: 'relative' }}>
          {!isAdmin && (
            <div style={{
              background: '#ebf8ff', borderLeft: '4px solid #3182ce', padding: '15px', marginBottom: '20px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
              <div>
                <strong>👀 Read-Only Mode</strong>
                <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: '#2c5282' }}>
                  You are viewing the live data. To Edit or Delete, please log in as Admin.
                </p>
              </div>
            </div>
          )}

          <EmployeeCrud isAdmin={isAdmin} password={password} onDataUpdate={handleDataUpdate} />
        </div>

        <hr style={{ margin: '40px 0', border: '0', borderTop: '1px solid #eee' }} />

        <TableViewer />
      </main>
    </div>
  );
}

export default App;
