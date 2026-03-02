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

        // Save user to session
        req.session.user = user;
        // TODO flash success message
        res.redirect('/projects');
    }
    catch (error) {
        console.error(error);
        //TODO flash error
        res.redirect('/login');
    }
};

/**
 * Handle user logout
 */
const processLogout = (req, res) => {
    // Does session not exist at all
    if (!req.session) {
        return res.redirect('/');
    }

    // remove session from database
    req.session.destroy((err) => {
        if (err) {
            //something went wrong destroying session
            console.error('Error destroying session:', err);

            // clear session cookie
            res.clearCookie('connect.sid');

            // return 500 error
            return res.status(500).send('Error logging out');
        }

        // session destruction succeeded
        // clear session cookie and go to home page
        res.clearCookie('connect.sid');
        res.redirect('/');
    });
};

// Create routes
router.get('/', showLoginForm);
router.post('/', processLogin);

export default router;
export { processLogout };
