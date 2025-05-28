require('dotenv').config();
const { Pool } = require('pg');
let pool;

if (process.env.GAEILGE_ENV === 'local') {
    pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT
    });
} else {
    pool = new Pool({
        connectionString: process.env.GAEILGE_API_URL
    });
}

module.exports = pool;
