import { body, validationResult } from 'express-validator';
import { findUserByUsername, verifyPassword } from '../../models/forms/login.js';
import { Router } from 'express';

const router = Router();

/**
 * Display the login form
 */
const showLoginForm = (req, res) => {
    res.render('forms/login/form', {
        title: 'Employee Login'
    });
};

/**
 * Process login form submission
 */
const processLogin = async (req, res) => {
    // Validation check
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        //TODO flash errors

        return res.redirect('/login');
    }

    // Retrieve username and password from sent form
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (!user) {
            //TODO flash error
            return res.redirect('/login');
        }

        const verified = await verifyPassword(password, user.password);
        if (!verified) {
            //TODO flash error
            return res.redirect('/login');
        }

        // Remove password from user object for security
        delete user.password;

        //TODO finish logging user in
    }
    catch (error) {
        console.error(error);
        //TODO flash error
        res.redirect('/login');
    }
};

// Create routes
router.get('/', showLoginForm);
router.post('/', processLogin);

export default router;
