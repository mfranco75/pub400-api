require('dotenv').config();
const express = require('express');
const cors = require('cors');
const odbc = require('odbc');

const app = express();
app.use(cors());

const CONN = `
DRIVER=IBM i Access ODBC Driver;
SYSTEM=${process.env.DB_SYSTEM};
UID=${process.env.DB_USER};
PWD=${process.env.DB_PASS};
`;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/tables/:library/:table', async (req, res) => {
  const { library, table } = req.params;

  const sql = `SELECT * FROM ${library}.${table} FETCH FIRST 100 ROWS ONLY`;

  try {
    const conn = await odbc.connect(CONN);
    const rows = await conn.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log("API running on port 3000");
});
