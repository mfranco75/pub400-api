require('dotenv').config();
const express = require('express');
const cors = require('cors');
const odbc = require('odbc');

const app = express();
app.use(cors());
app.use(express.json());

let pool;

async function initPool() {
  try {
    pool = await odbc.pool({
      connectionString: `DRIVER=IBM i Access ODBC Driver;SYSTEM=${process.env.DB_SYSTEM};UID=${process.env.DB_USER};PWD=${process.env.DB_PASS};`,
      initialSize: 2,
      maxSize: 10,
      shrink: true
    });
    console.log('ODBC Connection Pool Initialized');
  } catch (err) {
    console.error('Failed to initialize ODBC pool:', err);
    process.exit(1);
  }
}

initPool();

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Middleware to protect routes
const requireAdmin = (req, res, next) => {
  const password = req.headers['x-admin-password'];
  console.log(`Auth Check: Received '${password}', Expected '${process.env.ADMIN_PASSWORD}'`);
  if (password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.post('/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, error: 'Invalid password' });
  }
});

app.get('/status', async (req, res) => {
  try {
    const result = await pool.query('SELECT 1 FROM SYSIBM.SYSDUMMY1');
    res.json({ connected: true, system: process.env.DB_SYSTEM });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

app.get('/tables/:library/:table', async (req, res) => {
  const { library, table } = req.params;

  const sql = `SELECT * FROM ${library}.${table} FETCH FIRST 100 ROWS ONLY`;

  try {
    const rows = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- EMPLOYEE CRUD (MARIANOFR1.EMPPF1) ---

// GET All Employees
app.get('/employees', async (req, res) => {
  const sql = `SELECT * FROM MARIANOFR1.EMPPF1 FETCH FIRST 100 ROWS ONLY`;
  try {
    const rows = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// POST Create Employee
app.post('/employees', requireAdmin, async (req, res) => {
  const { EMPID, EMPNAME, EMPCITY, EMPSTATE } = req.body;
  const sql = `INSERT INTO MARIANOFR1.EMPPF1 (EMPID, EMPNAME, EMPCITY, EMPSTATE) VALUES (?, ?, ?, ?)`;

  try {
    await pool.query(sql, [EMPID, EMPNAME, EMPCITY, EMPSTATE]);
    res.json({ message: 'Employee created', id: EMPID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// PUT Update Employee
app.put('/employees/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { EMPNAME, EMPCITY, EMPSTATE } = req.body;
  const sql = `UPDATE MARIANOFR1.EMPPF1 SET EMPNAME=?, EMPCITY=?, EMPSTATE=? WHERE EMPID=?`;

  try {
    await pool.query(sql, [EMPNAME, EMPCITY, EMPSTATE, id]);
    res.json({ message: 'Employee updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE Employee
app.delete('/employees/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM MARIANOFR1.EMPPF1 WHERE EMPID=?`;

  try {
    await pool.query(sql, [id]);
    res.json({ message: 'Employee deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

console.log("Attempting to start server...");
app.listen(3000, () => {
  console.log("API running on port 3000");
  // Keep alive hack
  setInterval(() => { }, 10000);
});
