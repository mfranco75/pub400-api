require('dotenv').config();
const odbc = require('odbc');

const CONN = `DRIVER=IBM i Access ODBC Driver;SYSTEM=${process.env.DB_SYSTEM};UID=${process.env.DB_USER};PWD=${process.env.DB_PASS};`;

async function setup() {
    try {
        const conn = await odbc.connect(CONN);
        console.log("Creating MARIANOFR1.QCUSTCDT from QIWS.QCUSTCDT...");

        // Check if it exists first to avoid error
        try {
            await conn.query("SELECT 1 FROM MARIANOFR1.QCUSTCDT FETCH FIRST 1 ROWS ONLY");
            console.log("Table MARIANOFR1.QCUSTCDT already exists.");
        } catch (e) {
            // If error, assume it doesn't exist and create it
            const sql = "CREATE TABLE MARIANOFR1.QCUSTCDT AS (SELECT * FROM QIWS.QCUSTCDT) WITH DATA";
            await conn.query(sql);
            console.log("Table MARIANOFR1.QCUSTCDT created successfully.");
        }

        await conn.close();
    } catch (err) {
        console.error("Error:", err.message);
    }
}

setup();
