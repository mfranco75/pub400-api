import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ employees }) => {
    const cityData = useMemo(() => {
        const counts = {};
        employees.forEach(emp => {
            const city = emp.EMPCITY ? emp.EMPCITY.trim() : 'Unknown';
            counts[city] = (counts[city] || 0) + 1;
        });
        return Object.keys(counts).map(city => ({
            name: city,
            count: counts[city]
        })).sort((a, b) => b.count - a.count); // Show all cities sorted by count
    }, [employees]);

    const stateData = useMemo(() => {
        const counts = {};
        employees.forEach(emp => {
            const state = emp.EMPSTATE ? emp.EMPSTATE.trim() : 'Unknown';
            counts[state] = (counts[state] || 0) + 1;
        });
        return Object.keys(counts).map(state => ({
            name: state,
            value: counts[state]
        }));
    }, [employees]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    if (employees.length === 0) return null;

    return (
        <div style={{ marginBottom: '40px', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>Employee Analytics</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-around', height: '300px' }}>

                <div style={{ width: '45%', minWidth: '300px', height: '100%' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '1rem', color: '#666' }}>Top Cities</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={cityData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" name="Employees" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={{ width: '45%', minWidth: '300px', height: '100%' }}>
                    <h3 style={{ textAlign: 'center', fontSize: '1rem', color: '#666' }}>Distribution by State</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={stateData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {stateData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
