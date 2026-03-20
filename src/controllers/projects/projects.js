import { nameExists, saveProject, getAllProjects, getProjectById, updateProject } from '../../models/projects.js';
import { requireRole } from '../../middleware/auth.js';
import { validationResult, body } from 'express-validator';
import { Router } from 'express';

const router = Router();

/**
 * Project Input Validation
 */
const projectValidation = [
    body('title')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Title must be between 2 and 100 characters'),
        //TODO .matches validation
    body('description')
        .trim()
        .isLength({ max: 65535 })
        .withMessage('Description must be less than or equal to 65535 characters'),
        //TODO .matches validation
];

/**
 * Show projects list
 */
const showProjectsList = async (req, res) => {
    // retrieve current user data
    const user = req.session.user;

    let projects = [];

    try {
        projects = await getAllProjects();
    }
    catch (error) {
        console.error('Error retrieving projects:', error);
        req.flash('error', 'Error retrieving projects');
        return res.redirect('/');
    }

    // Render projects list
    res.render('projects/list', {
        title: 'Projects',
        user,
        projects
    });
};

/**
 * Show project details and tasks
 */
const showProjectDetails = async (req, res) => {
    // retrieve current user data
    const user = req.session.user;

    //retrieve project to edit
    const projectId = parseInt(req.params.id);
    let project = [];
    let tasks = null;

    try {
        project = await getProjectById(projectId);
        //tasks = await getTasksByProjectId(projectId);
    }
    catch (error) {
        console.error('Error retrieving project and/or tasks:', error);
        req.flash('error', 'Error retrieving project and/or tasks');
        //TODO test to make sure this redirects back to /projects
        return res.redirect('/');
    }

    //render project details page
    res.render(`projects/details`, {
        title: project.name,
        user,
        project,
        tasks
    });
};

/**
 * Show add project form
 */
const showAddProject = async (req, res) => {
    // retrieve current user data
    const user = req.session.user;

    // if there is any temporary project data from a previous attempt to add a project, retrieve it now
    let project = { name: '', description: '', archived: false };
    if (req.session.project) {
        project = req.session.project;
    }

    // render add project page 
    res.render('projects/add-edit', {
        title: 'New Project',
        user,
        edit: false,
        project 
    });
};

/**
 * Process adding a new project
 */
const processAddProject = async (req, res) => {
    // Get project data from body
    const { title, description, archived } = req.body;

    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //display errors as flash errors
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        // Save already entered project data to the session so that the user doesn't have to reenter it
        const project = { name: title, description, archived };
        req.session.project = project;

        // redirect back to add project page
        return res.redirect('/projects/add');
    }

    try {
        // Make sure title is unique
        if (await nameExists(title)) {
            // Save already entered project data to the session so that the user doesn't have to reenter it
            const project = { name: title, description, archived };
            req.session.project = project;

            // send a flash error to the user
            req.flash('error', 'That project title is already taken.');
            return res.redirect('/projects/add');
        }

        // Save project to database
        await saveProject(title, req.session.user.id, description, archived);

        // If there is any temporary project data in the session, delete it so that is doesn't show up in the form later
        delete req.session.project;

        // send success message to user
        req.flash('success', `${title} successfully added`);
        return res.redirect('/projects');
    }
    catch (error) {
        // Save already entered project data to the session so that the user doesn't have to reenter it
        const project = { name: title, description, archived };
        req.session.project = project;

        console.error('Error saving project:', error);
        req.flash('error', 'An unexpected error occurred saving the project.');
        res.redirect('/projects/add');
    }
};

const showEditProject = async (req, res) => {
    // retrieve current user data
    const user = req.session.user;

    //retrieve project data for prefilling the form
    const projectId = parseInt(req.params.id);
    let project = [];

    try {
        project = await getProjectById(projectId);
    }
    catch (error) {
        console.error('Error retrieving project', error);
        req.flash('error', 'Error retreiving project');
        //TODO test to make sure this redirect back to /projects
        return res.redirect('/');
    }

    // render project edit form
    res.render('projects/add-edit', {
        title: `Edit ${project.name}`,
        user,
        edit: true,
        project,
        projectId
    });
};

const processEditProject = async (req, res) => {
    const { title, description, archived: arch } = req.body;

    // converted archived to boolean
    let archived = false;
    if (arch) {
        archived = true;
    }

    const projectId = parseInt(req.params.id);

    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        //display errors as flash errors
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        // Save already entered project data to the session so that the user doesn't have to reenter it
        const project = { name: title, description, archived };
        req.session.project = project;

        // redirect back to edit project page
        return res.redirect(`/projects/${projectId}/edit`);
    }

    try {
        // update project to database
        await updateProject(projectId, title, description, archived);

        // If there is any temporary project data in the session, delete it
        delete req.session.project;

        // send success message to user
        req.flash('success', `${title} successfully added`);
        return res.redirect('/projects');
    }
    catch (error) {
        // Save already entered project data to the session
        const project = { name: title, description, archived };
        req.session.project = project;

        console.error('Error saving project:', error);
        req.flash('error', 'An unexpected error occurred saving the project');
        res.redirect(`/projects/${projectId}/edit`);
    }
};

/**
 * GET /projects - Display the projects list page
 */
router.get('/', requireRole('employee'), showProjectsList);

/**
 * GET /projects/:id/details - Display project details and tasks page
 */
router.get('/:id/details', requireRole('employee'), showProjectDetails);

/**
 * GET /projects/add - Display add project form page
 */
router.get('/add', requireRole('admin'), showAddProject);

/**
 * POST /projects/add - Send the add project form
 */
router.post('/add', requireRole('admin'), projectValidation, processAddProject);

/**
 * GET /projects/:id/edit - Display edit project page (same as add project page but prefilled)
 */
router.get('/:id/edit', requireRole('admin'), showEditProject);

/**
 * POST /projects/:id/edit - Send the edit project form
 */
router.post('/:id/edit', requireRole('admin'), projectValidation, processEditProject);

export default router;