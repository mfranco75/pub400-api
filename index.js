require('dotenv').config();
const express = require('express');
const cors = require('cors');
const odbc = require('odbc');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();

// Security Headers
app.use(helmet());

// CORS Restriction
const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  }
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 login requests per hour
  message: "Too many login attempts, please try again after an hour"
});

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

  if (password === process.env.ADMIN_PASSWORD) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.post('/login', loginLimiter, (req, res) => {
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
    console.error("Status Error:", err);
    res.status(500).json({ connected: false, error: 'Database connection failed' });
  }
});

app.get('/tables/:library/:table', async (req, res) => {
  const { library, table } = req.params;

  // SQL Injection Prevention: Allow only alphanumeric characters
  const isValidIdentifier = /^[A-Z0-9]+$/i.test(library) && /^[A-Z0-9]+$/i.test(table);

  if (!isValidIdentifier) {
    return res.status(400).json({ error: 'Invalid library or table name' });
  }

  const sql = `SELECT * FROM ${library}.${table} FETCH FIRST 100 ROWS ONLY`;

  try {
    const rows = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Table Fetch Error:", err);
    res.status(500).json({ error: 'Failed to fetch table data' });
  }
});

// --- SYSTEM INFO ---
app.get('/system-info', async (req, res) => {
  try {
    // 1. User Storage Info
    const userSql = `
      SELECT AUTHORIZATION_NAME, STORAGE_USED, PREVIOUS_SIGNON 
      FROM QSYS2.USER_INFO 
      WHERE AUTHORIZATION_NAME = '${process.env.DB_USER.toUpperCase()}'
    `;
    // 2. Spool File Count (Recent 5)
    const spoolSql = `
      SELECT JOB_NAME, SPOOLED_FILE_NAME, FILE_NUMBER, CREATE_TIMESTAMP
      FROM QSYS2.OUTPUT_QUEUE_ENTRIES_BASIC
      WHERE USER_NAME = '${process.env.DB_USER.toUpperCase()}'
      ORDER BY CREATE_TIMESTAMP DESC
      FETCH FIRST 5 ROWS ONLY
    `;

    // Execute in parallel for performance
    const [userResult, spoolResult] = await Promise.all([
      pool.query(userSql),
      pool.query(spoolSql)
    ]);

    const userInfo = userResult[0] || {};

    // Helper to handle BigInt
    const serialize = (obj) => {
      return JSON.parse(JSON.stringify(obj, (key, value) =>
        typeof value === 'bigint'
          ? value.toString()
          : value // return everything else unchanged
      ));
    };

    res.json(serialize({
      user: userInfo,
      spool: spoolResult
    }));
  } catch (err) {
    console.error("System Info Error:", err);
    res.status(500).json({ error: 'Failed to fetch system info' });
  }
});

// --- EMPLOYEE CRUD (MARIANOFR1.EMPPF1) ---

// GET All Employees
app.get('/employees', async (req, res) => {
  const sql = `SELECT * FROM MARIANOFR1.EMPPF1 ORDER BY EMPID FETCH FIRST 100 ROWS ONLY`;
  try {
    const rows = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Get Employees Error:", err);
    res.status(500).json({ error: 'Failed to fetch employees' });
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
    console.error("Create Employee Error:", err);
    res.status(500).json({ error: 'Failed to create employee' });
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
    console.error("Update Employee Error:", err);
    res.status(500).json({ error: 'Failed to update employee' });
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
    console.error("Delete Employee Error:", err);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// --- CUSTOMER CRUD (MARIANOFR1.QCUSTCDT) ---

// GET All Customers
app.get('/customers', async (req, res) => {
  const sql = `SELECT * FROM MARIANOFR1.QCUSTCDT FETCH FIRST 100 ROWS ONLY`;
  try {
    const rows = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("Get Customers Error:", err);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// POST Create Customer
app.post('/customers', requireAdmin, async (req, res) => {
  const { CUSNUM, LSTNAM, INIT, STREET, CITY, STATE, ZIPCOD, CDTLMT, CHGCOD, BALDUE, CDTDUE } = req.body;
  const sql = `INSERT INTO MARIANOFR1.QCUSTCDT (CUSNUM, LSTNAM, INIT, STREET, CITY, STATE, ZIPCOD, CDTLMT, CHGCOD, BALDUE, CDTDUE) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    await pool.query(sql, [CUSNUM, LSTNAM, INIT, STREET, CITY, STATE, ZIPCOD, CDTLMT, CHGCOD, BALDUE, CDTDUE]);
    res.json({ message: 'Customer created', id: CUSNUM });
  } catch (err) {
    console.error("Create Customer Error:", err);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// PUT Update Customer
app.put('/customers/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { LSTNAM, INIT, STREET, CITY, STATE, ZIPCOD, CDTLMT, CHGCOD, BALDUE, CDTDUE } = req.body;
  const sql = `UPDATE MARIANOFR1.QCUSTCDT SET LSTNAM=?, INIT=?, STREET=?, CITY=?, STATE=?, ZIPCOD=?, CDTLMT=?, CHGCOD=?, BALDUE=?, CDTDUE=? WHERE CUSNUM=?`;

  try {
    await pool.query(sql, [LSTNAM, INIT, STREET, CITY, STATE, ZIPCOD, CDTLMT, CHGCOD, BALDUE, CDTDUE, id]);
    res.json({ message: 'Customer updated' });
  } catch (err) {
    console.error("Update Customer Error:", err);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// DELETE Customer
app.delete('/customers/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM MARIANOFR1.QCUSTCDT WHERE CUSNUM=?`;

  try {
    await pool.query(sql, [id]);
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    console.error("Delete Customer Error:", err);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

console.log("Attempting to start server...");
app.listen(process.env.PORT || 3000, () => {
  console.log(`API running on port ${process.env.PORT || 3000}`);
  // Keep alive hack
  setInterval(() => { }, 10000);
});
