import { homePage } from './index.js';

import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import { processLogout } from './forms/login.js';

import adminDashboardRoutes from './admin/dashboard.js';

import { requireRole } from '../middleware/auth.js';

import { Router } from 'express';

// Create the router
const router = Router();

// dynamically add specific css sheets to different routes
router.use('/register', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/registration.css">');
    next();
});

router.use('/login', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/login.css">');
    next();
});

router.use('/admin-dashboard', (req, res, next) => {
    res.addStyle('<link rel="stylesheet" href="/css/admin-dashboard.css">');
    next();
});

router.get('/', homePage);

router.use('/register', registrationRoutes);
router.use('/login', /*loginValidation,*/ loginRoutes);

router.get('/logout', processLogout);
router.use('/admin-dashboard', adminDashboardRoutes);

export default router;