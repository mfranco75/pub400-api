require('dotenv').config();
const odbc = require('odbc');

const CONN = `DRIVER=IBM i Access ODBC Driver;SYSTEM=${process.env.DB_SYSTEM};UID=${process.env.DB_USER};PWD=${process.env.DB_PASS};`;

async function checkStatus() {
    try {
        console.log("Connecting...");
        const conn = await odbc.connect(CONN);
        console.log("Connected. Querying SYSIBM.SYSDUMMY1...");
        const result = await conn.query('SELECT 1 FROM SYSIBM.SYSDUMMY1');
        console.log("Success! Result:", result);
        await conn.close();
    } catch (err) {
        console.error("Error:", err);
    }
}

checkStatus();
