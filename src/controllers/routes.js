import { homePage } from './index.js';

import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import { processLogout } from './forms/login.js';

import adminDashboardRoutes from './admin/dashboard.js';

import projectsRoutes from './projects/projects.js';

import { requireRole } from '../middleware/auth.js';

import { Router } from 'express';

// Create the router
const router = Router();

// dynamically add specific css sheets to different routes
router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/form.css">');
    next();
});

router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/form.css">');
    next();
});

router.use('/projects', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/form.css">');
    next();
});

router.use('/admin-dashboard', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/admin.css">');
    next();
});

router.get('/', homePage);

router.use('/register', registrationRoutes);
router.use('/login', /*loginValidation,*/ loginRoutes);

router.get('/logout', requireRole('pending employee'), processLogout);

//TODO change admin dashboard URL to something secret
router.use('/admin-dashboard', adminDashboardRoutes);

router.use('/projects', requireRole('employee'), projectsRoutes);

export default router;