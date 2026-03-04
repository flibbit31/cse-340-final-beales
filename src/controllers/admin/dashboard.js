import { getAllUsers, getUserById, deleteUser } from '../../models/forms/registration.js';
import { updatePassword, updateRole } from '../../models/admin/dashboard.js';
import { requireRole } from '../../middleware/auth.js';
import bcrypt from 'bcrypt';
import { body, validationResult } from 'express-validator';
import { Router } from 'express';

const router = Router();

const updatePasswordValidation = [
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

/**
 * Display admin dashboard
 */
const showAdminDashboard = async (req, res) => {
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
        return res.redirect('/');
    }

    let users = [];
    //retrieve all users from database to send to view
    try {
        users = await getAllUsers();
    }
    catch (error) {
        console.error('Error retrieving users:', error);
        req.flash('error', 'Error retrieving users');
        return res.redirect('/');
    }

    // Render admin dashboard
    res.render('admin-dashboard', {
        title: 'Admin Dashboard',
        user,
        users
    });
};

const processUpdatePassword = async (req, res) => {
    //process password validation errors
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
        validationErrors.array().forEach(error => {
            req.flash('error', error.msg);
        });
        return res.redirect('/admin-dashboard');
    }

    //gather data from req
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;
    const { password } = req.body;

    try {
        //get target user
        const targetUser = await getUserById(targetUserId);

        if (!targetUser) {
            req.flash('error', 'Employee not found.');
            return res.redirect('/admin-dashboard');
        }

        //check admin role of currentUser
        if (currentUser.roleName !== 'admin') {
            req.flash('error', 'You do not have permission to change this password.');
            return res.redirect('/');
        }

        //hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Update the password in the model
        await updatePassword(targetUserId, hashedPassword);

        // Flash success and finish
        req.flash('success', 'Password changed successfully');
        res.redirect('/admin-dashboard');
    }
    catch (error) {
        console.error('Error updating password:', error);
        req.flash('error', 'An error occurred while changing the password.');
        res.redirect('admin-dashboard');
    }
};

const processUpdateRole = async (req, res) => {
    //gather data from req
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;
    const { role } = req.body;

    try {
        //get target user
        const targetUser = await getUserById(targetUserId);

        if (!targetUser) {
            req.flash('error', 'Employee not found.');
            return res.redirect('/admin-dashboard');
        }

        //check admin role of currentUser and that they are not trying to change their own role
        if (currentUser.roleName !== 'admin' && currentUser.id !== targetUser.id) {
            req.flash('error', 'You do not have permission to change this role.');
            return res.redirect('/admin-dashboard');
        }

        // Update the role in the model and finish
        await updateRole(targetUserId, role);

        req.flash('success', 'Role changed successfully');
        res.redirect('/admin-dashboard');
    }
    catch (error) {
        console.error('Error updating role:', error);
        req.flash('error', 'An error occurred while changing the role.');
        res.redirect('/admin-dashboard');
    }
};

/**
 * Delete a user's account
 */
const processDeleteAccount = async (req, res) => {
    const targetUserId = parseInt(req.params.id);
    const currentUser = req.session.user;

    // check if user is an admin
    if (currentUser.roleName !== 'admin') {
        req.flash('error', 'You do not have permission to delete this account.');
        return res.redirect('/admin-dashboard');
    }

    // prevent deleting one's own account
    if (targetUserId === currentUser.id) {
        req.flash('error', 'You cannot delete your own account.');
        return res.redirect('/admin-dashboard');
    }

    try {
        const deleted = await deleteUser(targetUserId);

        if (deleted) {
            req.flash('success', 'Employee account successfully deleted');
        }

        else {
            req.flash('error', 'User not found or account has already been deleted');
        }
    }
    catch (error) {
        console.error('Error deleting user:', error);
        req.flash('error', 'There was an error deleting this account.');
    }

    res.redirect('/admin-dashboard');
};

/**
 * GET /admin-dashboard - Display admin dashboard
 */
router.get('/', requireRole('admin'), showAdminDashboard);

/**
 * POST /admin-dashboard/:id/updatePassword
 */
router.post('/:id/updatePassword', requireRole('admin'), updatePasswordValidation, processUpdatePassword);

/**
 * POST /admin-dashboard/:id/updateRole
 */
router.post('/:id/updateRole', requireRole('admin'), processUpdateRole);

/**
 * POST /admin-dashboard/:id/deleteAccount
 */
router.post('/:id/deleteAccount', requireRole('admin'), processDeleteAccount);

export default router;