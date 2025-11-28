require('dotenv').config();
const odbc = require('odbc');

const CONN = `DRIVER=IBM i Access ODBC Driver;SYSTEM=${process.env.DB_SYSTEM};UID=${process.env.DB_USER};PWD=${process.env.DB_PASS};`;

async function check() {
    try {
        const conn = await odbc.connect(CONN);
        console.log("Checking MARIANOFR1.QCUSTCDT...");
        const sql = "SELECT * FROM MARIANOFR1.QCUSTCDT FETCH FIRST 1 ROWS ONLY";
        const result = await conn.query(sql);
        console.log("Success! Columns:", Object.keys(result[0] || {}));
        await conn.close();
    } catch (err) {
        console.error("Error:", err.message);
    }
}

check();
