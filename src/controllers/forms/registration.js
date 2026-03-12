import { Router } from 'express';
import { validationResult, body } from 'express-validator';
import bcrypt from 'bcrypt';
import { usernameExists, saveUser, getAllUsers, getUserById, updateUsername, deleteUser } from '../../models/forms/registration.js';

const router = Router();

/**
 * Display registration page
 */
 const showRegistrationForm = (req, res) => {
    res.render('forms/registration/form', {
        title: 'Employee Registration'
    });
 };

 /**
  * Process User Registration
  */
 const processRegistration = async (req, res) => {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // display errors as flash errors
        errors.array().forEach(error => {
            req.flash('error', error.msg);
        });

        // redirect back to registration page
        return res.redirect('/register');
    }

    // Get user data from req
    const { username, password } = req.body;
    try {
        // Make sure username is unique
        if (await usernameExists(username)) {
            req.flash('error', 'That username is already taken.');
            return res.redirect('/register');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Save user to database
        await saveUser(username, hashedPassword);

        req.flash('success', 'Registration successful');
        return res.redirect('/login');
    }
    catch (error) {
        console.error('Error saving user:', error);
        req.flash('error', 'An unexpected registration error occurred.');
        res.redirect('/register');
    }
 };

 /**
  * Display all registered users
  */
 /*const showAllUsers = async (req, res) => {
    let users = [];

    try {
        users = await getAllUsers();
    }
    catch (error) {
        console.error('Error retrieving users:', error);
        req.flash('error', 'Error retrieving users');
    }

    res.render('forms/registration/list', {
        title: 'Registered Employees',
        users,
        user: req.session && req.session.user ? req.session.user : null
    });
 }; */

 /**
  * Validation
  */
 const registrationValidation = [
    body('username')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Username must be between 2 and 100 characters'),
        //TODO .matches validation
    body('password')
        .isLength({ min: 8, max: 128})
        .withMessage('Password must be between 8 and 128 characters')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
        .withMessage('Password must contain at least one special character'),
    body('passwordConfirm')
        .custom((value, { req }) => value === req.body.password)
        .withMessage('Passwords must match')
 ];

 // router setup

 // GET /register - Display registration form
 router.get('/', showRegistrationForm);

 // POST /register - Process registration form
 router.post('/', registrationValidation, processRegistration);

 // TODO setup rest of registration routes

 export default router;