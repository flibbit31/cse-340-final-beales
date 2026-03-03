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
        //create flash errors
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        return res.redirect('/login');
    }

    // Retrieve username and password from sent form
    const { username, password } = req.body;

    try {
        const user = await findUserByUsername(username);
        if (!user) {
            //invalid username
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');
        }

        const verified = await verifyPassword(password, user.password);
        if (!verified) {
            //invalid password
            req.flash('error', 'Invalid username or password');
            return res.redirect('/login');
        }

        // Remove password from user object for security
        delete user.password;

        // Save user to session
        req.session.user = user;

        req.flash('success', 'Login successful');
        res.redirect('/projects');
    }
    catch (error) {
        console.error(error);
        req.flash('error', 'An unexpected login error occurred');
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

/**
 * Display admin dashboard
 */
const showAdminDashboard = (req, res) => {
    const user = req.session.user;
    const sessionData = req.session;

    let passwordFound = false;

    // Make sure password is deleted from user object and session for security
    if (user && user.password) {
        console.error('Security error: password found in user object');
        delete user.password;
        passwordFound = true;
    }
    if (sessionData.user && sessionData.user.password) {
        console.error('Security error: password found in sessionData.user');
        delete sessionData.user.password;
        passwordFound = true;
    }

    if (passwordFound) {
        return;
    }

    // Render admin dashboard
    res.render('admin-dashboard', {
        title: 'Admin Dashboard',
        user,
        sessionData
    });
};

// Create routes
router.get('/', showLoginForm);
router.post('/', processLogin);

export default router;
export { processLogout, showAdminDashboard };
