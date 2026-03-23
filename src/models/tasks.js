import db from './db.js';

/**
 * Save a new project to the database
 * 
 * @param {number} project_id - The id of the enclosing project
 * @param {string} name - The task name
 * @param {number} creator_id - The id of the creator
 * @param {string|null} description - The optional description
 * @param {number} priority - The task priority (lower number equals higher priority)
 * @param {boolean} general - General or delegated task
 * @param {string} status - Status: created, accepted, completed, or archived
 * @param {number|null} acceptor_id - The id of the accepting employee (if the task is delegated)
 */
const saveTask = async (project_id, name, creator_id, description = null, priority, general, status, acceptor_id = null) => {
    const query = `
        INSERT INTO tasks (project_id, name, creator_id, description, priority, general, status, acceptor_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, project_id, name, creator_id, description, priority, general, status, acceptor_id
    `;
    const result = await db.query(query, [project_id, name, creator_id, description, priority, general, status, acceptor_id]);
    return result.rows[0];
};

/**
 * Get a list of tasks that belong to the given project
 * @param {number} project_id - The id of the project to retrieve the tasks of
 * @returns {Promise<Array>|null} Array of tasks from the given project id or null if nothing can be found
 */
const getTasksByProjectId = async (project_id) => {
    const query = `
        SELECT tasks.id, tasks.name, tasks.description, tasks.priority, tasks.general, tasks.status, tasks.creator_id, tasks.acceptor_id, tasks.created_at, tasks.updated_at, tasks.project_id
        FROM tasks
        WHERE tasks.project_id = $1
        ORDER BY created_at ASC
    `;
    const results = await db.query(query, [project_id]);
    return results.rows || null;
};

/**
 * Get a task by it's id
 * @param {number} task_id - The id of the task to retrieve
 * @returns {Promise<Object>|null} - The task object or null if it doesn't exist
 */
const getTaskById = async (task_id) => {
    const query = `
        SELECT tasks.id, tasks.name, tasks.description, tasks.priority, tasks.general, tasks.status, tasks.creator_id, tasks.acceptor_id, tasks.created_at, tasks.updated_at, tasks.project_id
        FROM tasks
        WHERE tasks.id = $1
        ORDER BY created_at ASC
    `;
    const result = await db.query(query, [task_id]);
    return result.rows[0] || null;
};

/**
 * Update project to the database
 * 
 * @param {number} task_id - The id of the task to update
 * @param {number} project_id - The id of the enclosing project
 * @param {string} name - The task name
 * @param {number} creator_id - The id of the creator
 * @param {string|null} description - The optional description
 * @param {number} priority - The task priority (lower number equals higher priority)
 * @param {boolean} general - General or delegated task
 * @param {string} status - Status: created, accepted, completed, or archived
 * @param {number|null} acceptor_id - The id of the accepting employee (if the task is delegated)
 */
const updateTask = async (task_id, project_id, name, creator_id, description = null, priority, general, status, acceptor_id = null) => {
    const query = `
        UPDATE tasks
        SET project_id = $2, name = $3, creator_id = $4, description = $5, priority = $6, general = $7, status = $8, acceptor_id = $9
        WHERE id = $1
        RETURNING id, project_id, name, creator_id, description, priority, general, status, acceptor_id
    `;
    const result = await db.query(query, [task_id, project_id, name, creator_id, description, priority, general, status, acceptor_id]);
    return result.rows[0];
};

/**
 * Delete a task by id
 * @param {number} task_id - The id of the task to delete
 * @returns {Promise<boolean>} Returns true if deletion is successful, false otherwise
 */
const deleteTask = async (task_id) => {
    const query = 'DELETE FROM tasks WHERE id = $1';
    const result = await db.query(query, [task_id]);
    return result.rowCount > 0;
};

export {
    saveTask,
    getTasksByProjectId,
    getTaskById,
    updateTask,
    deleteTask
};