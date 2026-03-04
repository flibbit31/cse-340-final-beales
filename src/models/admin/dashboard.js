import db from '../db.js';
import { getRoleId } from '../forms/registration.js';

/**
 * Update a user's hashed password
 */
const updatePassword = async (id, hashedPassword) => {
    const query = `
        UPDATE users
        SET password = $2
        WHERE id = $1
        RETURNING id, username, updated_at
    `;
    const result = await db.query(query, [id, hashedPassword]);
    return result.rows[0] || null;
};

/**
 * Update a user's role
 */
const updateRole = async (id, roleName) => {
    let roleId = await getRoleId(roleName);
    roleId = roleId.toString();
    const query = `
        UPDATE users
        SET role_id = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, role_id, updated_at
    `;
    const result = await db.query(query, [id, roleId]);
    return result.rows[0] || null;
};

export { updatePassword, updateRole };