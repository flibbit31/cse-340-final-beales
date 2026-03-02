import bcrypt from 'bcrypt';
import db from '../db.js';

/**
 * Find a user by username for login verification
 *
 * @param {string} username - Username to search for
 * @returns {Promise<Object|null>} User object with hashed password or null if user not found
 */
const findUserByUsername = async (username) => {
    const query = `
        SELECT
            users.id,
            users,username,
            users.password,
            users.created_at,
            users.updated_at,
            roles.role_name AS "roleName"
        FROM users
        INNER JOIN roles ON users.role_id = roles.id
        WHERE LOWER(users.username) = LOWER($1)
        LIMIT 1
    `;
    const result = await db.query(query, [username]);
    return result.rows[0] || null;
};

/**
 * Verify a plain text password against a stored bcrypt hashed password
 * 
 * @param {string} plainPassword - The sent password
 * @param {string} hashedPassword - The stored, hashed password
 * @returns {Promise<boolean>} True if match, false otherwise
 */
const verifyPassword = async (plainPassword, hashedPassword) => {
    const matches = await bcrypt.compare(plainPassword, hashedPassword);
    return matches;
};

export { findUserByUsername, verifyPassword };