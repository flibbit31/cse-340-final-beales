import db from './db.js';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const setupDatabase = async () => {
    // Create database tables that don't exist
    console.log('Creating database tables...');

    const createTablesPath = join(__dirname, 'sql', 'createTables.sql');
    const createTablesSQL = fs.readFileSync(createTablesPath, 'utf8');
    await db.query(createTablesSQL);

    // Insert role data into roles table
    const rolesPath = join(__dirname, 'sql', 'roles.sql');
    const rolesSQL = fs.readFileSync(rolesPath, 'utf8');
    await db.query(rolesSQL);

    console.log('Tables created successfully');

    
};

export { setupDatabase };



