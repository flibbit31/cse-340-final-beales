import { homePage } from './index.js';

import registrationRoutes from './forms/registration.js';

import { Router } from 'express';

// Create the router
const router = Router();

router.get('/', homePage);

router.use('/register', registrationRoutes);

export default router;