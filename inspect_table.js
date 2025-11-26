require('dotenv').config();
const odbc = require('odbc');

const CONN = `
DRIVER=IBM i Access ODBC Driver;
SYSTEM=${process.env.DB_SYSTEM};
UID=${process.env.DB_USER};
PWD=${process.env.DB_PASS};
`;

async function inspect() {
    try {
        const conn = await odbc.connect(CONN);
        // Try to find EMPPF1 in the user's library list or specific library
        // We'll try a generic select to get column names
        const sql = "SELECT * FROM MARIANOFR1.EMPPF1 FETCH FIRST 1 ROWS ONLY";
        const result = await conn.query(sql);
        console.log("Columns:", Object.keys(result[0]));
        console.log("Sample Data:", result[0]);
        await conn.close();
    } catch (err) {
        console.error("Error:", err.message);
    }
}

inspect();
