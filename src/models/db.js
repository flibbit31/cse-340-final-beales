import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CA certificate
const caCert = fs.readFileSync(path.join(__dirname, '../../bin', 'byuicse-psql-cert.pem'));

// Setup connection pool
const pool = new Pool({
    connectionString: process.env.DB_URL,
    ssl: {
        ca: caCert,
        rejectUnathuroized: true,
        checkServerIdentity: () => { return undefined; }
    }
});

let db = null;

// log queries in development mode
if (process.env.NODE_ENV.includes('dev') && process.env.ENABLE_SQL_LOGGING === 'true') {
    db = {
        async query(text, params) {
            try {
                const start = Date.now();
                const res = await pool.query(text, params);
                const duration = Date.now() - start;
                console.log('Executed query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    duration: `${duration}ms`,
                    rows: res.rowCount
                });
                return res;
            }
            catch (error) {
                console.error('Error in query:', {
                    text: text.replace(/\s+/g, ' ').trim(),
                    error: error.message
                });
                throw error;
            }
        },

        async close() {
            await pool.end();
        }
    };
}

else {
    // in production don't log SQL
    db = pool;
}

export default db;
export { caCert };