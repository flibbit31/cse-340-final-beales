import { nameExistsInProject, saveTask, getTasksByProjectId, getTaskById, updateTask, deleteTask } from '../models/tasks.js';
import { getProjectById } from '../models/projects.js';
import { requireRole } from '../middleware/auth.js';
import { validationResult, body } from 'express-validator';
import { Router } from 'express';

const taskRouter = Router({ mergeParams: true });

/**
 * Task input validation
 */
const taskValidation = [
    body('title')   
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Title must be between 2 and 100 characters'),
        // TODO .matches validation
    body('description')
        .trim()
        .isLength({ max: 65535 })
        .withMessage('Description must be less than or equal to 65535 characters'),
        // TODO .matches validation
    body('priority')
        .trim()
        .isInt({ min: 1, max: 10, allow_leading_zeroes: false})
        .withMessage('Priority must be between 1 and 10.'),
    /*body('status')
        .trim()
        .toLowerCase()
        .custom((value) => value === 'created' || value === 'accepted' || value === 'completed') 
        .withMessage('Invalid status')
        .custom((value, { req }) => value !== 'accepted' || req.body.general !== 'general') //May use boolean for req.body.general at some point
        .withMessage('Accepted status only valid with a delegated task'),*/
    /*body('acceptor_id')
        .trim()
        .isInt()
        .custom((value, { req }) => (!value) || req.body.general !== 'general')
        .withMessage('Accepting employee only valid with delegated task')*/
];

/**
 * Show Task details and options
 */
const showTaskDetails = async (req, res) => {
    // retrieve current user data
    const user = req.session.user;

    // retrieve task to show
    const taskId = parseInt(req.params.task_id)
};

/**
 * Show add task form
 */
const showAddTask = async (req, res) => {
    //retrieve current user data
    const user = req.session.user;

    // TODO allow restoring task data from a previous attempt

    const projectId = req.params.id;
    const project = await getProjectById(projectId);
    const projectName = project.name;

    // render add task page
    res.render('tasks/add-edit', {
        title: `Add new task to ${projectName}`,
        user,
        edit: false,
        projectId,
        projectName
    });
};

/**
 * Process adding a new task
 */
const processAddTask = async (req, res) => {
    // Get task data from body
    const { title, description, archived: arch, general: gen, priority } = req.body;

    // Get project id from params
    const projectId = req.params.id;

    //convert archived and general to boolean
    let archived = false;
    if (arch) {
        archived = true;
    }

    let general = false;
    if (gen) {
        general = true;
    }

    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //display errors as flash errors
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        //redirect back to add task page
        return res.redirect(`/projects/${projectId}/tasks/add`);
    }

    try {
        // Make sure title is unique
        if (await nameExistsInProject(projectId, title)) {
            // send a flash error to the user
            req.flash('error', 'That task name is already taken in this project');
            return res.redirect(`/projects/${projectId}/tasks/add`);
        }

        // Save task to database
        await saveTask(projectId, title, req.session.user.id, description, priority, general, 'created', archived, null);

        // send success message to user
        req.flash('success', `${title} successfully added`);
        return res.redirect(`/projects/${projectId}/details`);
    }
    catch (error) {
        // send error to console and user 
        console.error('Error saving task:', error);
        req.flash('error', 'An unexpected error occurred saving the task.');
        res.redirect(`/projects/${projectId}/tasks/add`);
    }
};

/**
 * GET /projects/:projectId/tasks/:taskId/edit
 */
const showEditTask = async (req, res) => {
    // retrieve current user data
    const user = req.session.user;

    //retrieve project/task data for prefilling the form
    const projectId = parseInt(req.params.id);
    const taskId = parseInt(req.params.taskId);
    let task = [];

    try {
        task = await getTaskById(taskId);
    }
    catch (error) {
        console.error('Error retrieving task', error);
        req.flash('error', 'Error retrieving task');
        return res.redirect(`/projects/${projectId}/details`);
    }

    // check if user has permission to edit this task
    if (user.roleName !== 'admin' && user.id !== task.creator_id) {
        req.flash('error', 'You do not have permission to edit this task.');
        return res.redirect(`/projects/${projectId}/details`);
    }

    // render task edit form
    res.render('tasks/add-edit', {
        title: `Edit ${task.name}`,
        user,
        edit: true,
        projectId,
        taskId: task.id,
        task
    });
};

/**
 * POST /projects/:projectId/tasks/:taskId/edit
 */
const processEditTask = async (req, res) => {
    // Get task data from body
    const { title, description, archived: arch, general: gen, priority } = req.body;

    // retrieve current user data
    const user = req.session.user;

    // Get project and task ids from params
    const projectId = parseInt(req.params.id);
    const taskId = parseInt(req.params.taskId);

    //convert archived and general to boolean
    let archived = false;
    if (arch) {
        archived = true;
    }

    let general = false;
    if (gen) {
        general = true;
    }

    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //display errors as flash errors
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        //redirect back to add task page
        return res.redirect(`/projects/${projectId}/tasks/${taskId}/edit`);
    }

    try {
        // Get task from database
        const task = await getTaskById(taskId);

        // check if user has permission to edit this task
        if (user.roleName !== 'admin' && user.id !== task.creator_id) {
            req.flash('error', 'You do not have permission to edit this task.');
            return res.redirect(`/projects/${projectId}/details`);
        }

        // Update task in database
        await updateTask(taskId, projectId, title, req.session.user.id, description, priority, general, task.status, archived, task.acceptor_id);

        // send success message to user
        req.flash('success', `${title} successfully edited`);
        return res.redirect(`/projects/${projectId}/details`);
    }
    catch (error) {
        // send error to console and user 
        console.error('Error editing task:', error);
        req.flash('error', 'An unexpected error occurred editing the task.');
        return res.redirect(`/projects/${projectId}/tasks/${taskId}/edit`);
    }
};

/**
 * GET /projects/:projectId/tasks/add
 */
taskRouter.get('/add', requireRole('employee'), showAddTask);

/**
 * POST /projects/:projectId/tasks/add
 */
taskRouter.post('/add', requireRole('employee'), taskValidation, processAddTask);

/**
 * GET /projects/:projectId/tasks/:taskId/edit
 */
taskRouter.get('/:taskId/edit', requireRole('employee'), showEditTask);

/**
 * POST /projects/:projectId/tasks/:taskId/edit
 */
taskRouter.post('/:taskId/edit', requireRole('employee'), taskValidation, processEditTask);

export default taskRouter;