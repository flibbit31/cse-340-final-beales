import { homePage } from './index.js';

import registrationRoutes from './forms/registration.js';
import loginRoutes from './forms/login.js';
import { processLogout, showAdminDashboard } from './forms/login.js';

import { requireRole } from '../middleware/auth.js';

import { Router } from 'express';

// Create the router
const router = Router();

router.get('/', homePage);

router.use('/register', registrationRoutes);
router.use('/login', /*loginValidation,*/ loginRoutes);

router.get('/logout', processLogout);
router.get('/admin-dashboard', requireRole('admin'), showAdminDashboard);

export default router;