import { homePage } from './index.js';

import { Router } from 'express';

// Create the router
const router = Router();

router.get('/', homePage);

export default router;