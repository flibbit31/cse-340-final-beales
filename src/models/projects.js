import db from './db.js';

/**
 * Check if project name already exists in projects table
 * 
 * @param {string} name - The name to check
 * @returns {Promise<boolean>} True if name already exists, false otherwise
 */
const nameExists = async(name) => {
    const query = `
        SELECT EXISTS(SELECT 1 FROM PROJECTS WHERE name = $1) as exists
    `;
    const result = await db.query(query, [name]);
    return result.rows[0].exists;
};

/**
 * Save a new project to the database
 * 
 * @param {string} name - The project name
 * @param {number} creator_id - The id of the creator
 * @param {string|null} description - The optional description
 * @param {boolean|null} archived - Archival status, false by default
 * @returns {Promise<Object>} The project object
 */
const saveProject = async (name, creator_id, description = null, archived = false) => {
    const query = `
        INSERT INTO projects (name, description, archived, creator_id)
        VALUES ($1, $3, $4, $2)
        RETURNING id, name, description, archived, creator_id, created_at
    `;
    const result = await db.query(query, [name, creator_id, description, archived]);
    return result.rows[0];
};

/**
 * Get all projects from the database
 * 
 * @returns {Promise<Array>} Array of project objects
 */
const getAllProjects = async () => {
    const query = `
        SELECT projects.id, projects.name, projects.description, projects.archived, users.username AS "creatorName", projects.created_at, projects.updated_at
        FROM projects
        INNER JOIN users ON users.id = projects.creator_id
        ORDER BY created_at ASC
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Get a project by it's id
 * 
 * @param {number} id - Project id
 * @returns {Promise<Object>} The project object
 */
const getProjectById = async (id) => {
    const query = `
        SELECT projects.id, projects.name, projects.description, projects.archived, projects.creator_id, users.username AS "creatorName", projects.created_at, projects.updated_at
        FROM projects
        INNER JOIN users ON users.id = projects.creator_id
        WHERE projects.id = $1
    `;
    const result = await db.query(query, [id]);
    return result.rows[0] || null;
};

/**
 * Update project name, description, and archival status by id (currently not allowing updating creator_id)
 * 
 * @param {number} id - Project id
 * @param {string} name - New project name
 * @param {string} description - New project description
 * @param {boolean} archived - New archival status
 * @returns {Promise<Object>|null} - The updated project object or null if no project is found
 */
const updateProject = async (id, name, description, archived) => {
    const query = `
        UPDATE projects
        SET name = $2, description = $3, archived = $4, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id, name, description, archived, updated_at
    `;
    const result = await db.query(query, [id, name, description, archived]);
    return result.rows[0] || null;
};

/**
 * Delete a project by id
 * 
 * @param {number} id - Project id
 * @returns {Promise<boolean>} Returns true if deletion is successful, false otherwise
 */
const deleteProject = async (id) => {
    const query = 'DELETE FROM projects WHERE id = $1';
    const result = await db.query(query, [id]);
    return result.rowCount > 0;
};

export {
    nameExists,
    saveProject,
    getAllProjects,
    getProjectById,
    updateProject,
    deleteProject
};