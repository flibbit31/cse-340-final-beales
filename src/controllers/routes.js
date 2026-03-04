import { homePage } from './index.js';

import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import { processLogout } from './forms/login.js';

import adminDashboardRoutes from './admin/dashboard.js';

import { requireRole } from '../middleware/auth.js';

import { Router } from 'express';

// Create the router
const router = Router();

router.get('/', homePage);

router.use('/register', registrationRoutes);
router.use('/login', /*loginValidation,*/ loginRoutes);

router.get('/logout', processLogout);
router.use('/admin-dashboard', adminDashboardRoutes);

export default router;