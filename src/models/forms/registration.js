import db from '../db.js';

/**
 * Check if a username already exists in the Users table
 * 
 * @param {string} username - The username to check existence of
 * @returns {Promise<boolean>} True if username exists, false otherwise
 */
const usernameExists = async (username) => {
    const query = `
        SELECT EXISTS(SELECT 1 FROM USERS WHERE username = $1) as exists
    `;
    const result = await db.query(query, [username]);
    return result.rows[0].exists;
};

/**
 * Save a new user to the database with default role_id(1)
 * 
 * @param {string} username - The user's username
 * @param {string} hashedPassword - The user's hashed password
 * @returns {Promise<Object>} The user object without password
 */
const saveUser = async (username, hashedPassword) => {
    const query = `
        INSERT INTO users (username, password, role_id)
        VALUES ($1, $2, 1)
        RETURNING id, username, created_at
    `;
    const result = await db.query(query, [username, hashedPassword]);
    return result.rows[0];
};

/**
 * Gets all users from the database.
 * 
 * @returns {Promise<Array>} Array of user objects
 */
const getAllUsers = async () => {
    const query = `
        SELECT users.id, users.username, roles.role_name AS "roleName", users.created_at
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        ORDER BY created_at DESC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Get a single user by their id
 * 
 * @param {} - User id
 * @returns {Promise<Object>} The user object
 */
const getUserById = async (id) => {
    const query = `
        SELECT users.id, users.username, users.created_at, roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE users.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

const getRoleId = async (roleName) => {
    const query = `
        SELECT id
        FROM roles
        WHERE role_name = $1
    `;
    const result = await db.query(query, [roleName]);
    return result.rows[0].id;
}

/**
 * Update a user's username by id
 * 
 * @param {} - User id
 * @param {string} - New username

 * @returns {Promise<Object>} The updated user object
 */
const updateUsername = async (id, username) => {
    const query = `
        UPDATE users
        SET username = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, username, updated_at
    `;
    const result = await db.query(query, [id, username]);
    return result.rows[0] || null;
};

/**
 * Delete a user by id
 * 
 * @param {} - User id
 * @returns {Promise<boolean>} Returns true if deletion successful, false otherwise
 */
const deleteUser = async (id) => {
    const query = 'DELETE FROM users WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

export {
    usernameExists,
    saveUser,
    getAllUsers,
    getUserById,
    getRoleId,
    updateUsername,
    deleteUser
};