import { getAllProjects, getProjectById } from '../../models/projects.js';
import { requireRole } from '../../middleware/auth.js';
import { Router } from 'express';

const router = Router();

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

    try {
        project = await getProjectById(projectId);
    }
    catch (error) {
        console.error('Error retrieving project:', error);
        req.flash('error', 'Error retrieving project');
        //TODO test to make sure this redirects back to /projects
        return res.redirect('/');
    }

    //render project details page
    res.render('projects/details', {
        title: project.name,
        user,
        project
    });
};

/**
 * Show add project form
 */
const showAddProject = async (req, res) => {
    // retrieve current user data
    const user = req.session.user;

    // render add project page 
    res.render('projects/add-edit', {
        title: 'New Project',
        user,
        project: null //this form is not being used for editing, so there is no current project info for prefilling the form
    });
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
        project
    });
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
 * GET /projects/add - Display add project page
 */
router.get('/add', requireRole('admin'), showAddProject);

/**
 * GET /projects/:id/edit - Display edit project page (same as add project page but prefilled)
 */
router.get('/:id/edit', requireRole('admin'), showEditProject);

export default router;