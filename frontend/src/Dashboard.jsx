import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, Treemap } from 'recharts';
import './Dashboard.css';

const CustomizedContent = (props) => {
    const { root, depth, x, y, width, height, index, colors, name } = props;

    return (
        <g>
            <rect
                x={x}
                y={y}
                width={width}
                height={height}
                style={{
                    fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : 'none',
                    stroke: '#fff',
                    strokeWidth: 2 / (depth + 1e-10),
                    strokeOpacity: 1 / (depth + 1e-10),
                }}
            />
            {depth === 1 ? (
                <text
                    x={x + width / 2}
                    y={y + height / 2 + 7}
                    textAnchor="middle"
                    fill="#fff"
                    fontSize={14}
                >
                    {name}
                </text>
            ) : null}
            {depth === 1 ? (
                <text
                    x={x + 4}
                    y={y + 18}
                    fill="#fff"
                    fontSize={16}
                    fillOpacity={0.9}
                >
                    {index + 1}
                </text>
            ) : null}
        </g>
    );
};

const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip" style={{ background: 'white', padding: '10px', border: '1px solid #ccc' }}>
                <p className="label">{`${payload[0].payload.name} : ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
};

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

    const treeMapData = useMemo(() => {
        const stateMap = {};

        employees.forEach(emp => {
            const state = emp.EMPSTATE ? emp.EMPSTATE.trim() : 'Unknown';
            const city = emp.EMPCITY ? emp.EMPCITY.trim() : 'Unknown';

            if (!stateMap[state]) {
                stateMap[state] = { name: state, children: [] };
            }

            const existingCity = stateMap[state].children.find(c => c.name === city);
            if (existingCity) {
                existingCity.size += 1;
            } else {
                stateMap[state].children.push({ name: city, size: 1 });
            }
        });

        return Object.values(stateMap);
    }, [employees]);

    const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

    if (employees.length === 0) return null;

    return (
        <div className="dashboard-container">
            <h2 className="dashboard-title">Employee Analytics</h2>
            <div className="charts-container">

                <div className="chart-wrapper">
                    <h3 className="chart-title">Top Cities</h3>
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

                <div className="chart-wrapper">
                    <h3 className="chart-title">Distribution by State</h3>
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

                <div className="chart-wrapper full-width">
                    <h3 className="chart-title">Geographic Hierarchy (State &gt; City)</h3>
                    <ResponsiveContainer width="100%" height="100%">
                        <Treemap
                            data={treeMapData}
                            dataKey="size"
                            aspectRatio={4 / 3}
                            stroke="#fff"
                            fill="#8884d8"
                            content={<CustomizedContent colors={COLORS} />}
                        >
                            <Tooltip content={<CustomTooltip />} />
                        </Treemap>
                    </ResponsiveContainer>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
