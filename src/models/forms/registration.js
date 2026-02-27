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
        SELECT id, username, roles.role_name AS "roleName", created_at
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

/**
 * Update a user's username or role by id
 * 
 * @param {} - User id
 * @param {string} - New username
 * @param {string} - New roleName
 * @returns {Promise<Object>} The updated user object
 */
const updateUser = async (id, username, roleName) => {
    const query = `
        UPDATE users
        SET username = $2, role_id = roles.id
        INNER JOIN roles ON $3 = roles.role_name
        WHERE id = $1
        RETURNING id, username, roles.role_name AS "roleName"
        INNER JOIN roles ON users.role_id = roles.id
    `;
    const result = await db.query(query, [id, username, roleName]);
    return result.rows[0] || null;
};

/**
 * Delete a user by id
 * 
 * @param {} - User id
 * @returns {Promise<boolean>} Returns true if deletion successful, false otherwise
 */
const deleteUser = async (id) => {
    const query = 'DELETE FROM user WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

export {
    usernameExists,
    saveUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser
};