/**
 * Middleware to check if user has required role or greater
 * 
 * @param {string} roleName - The minimum required role
 * @returns {Function} Middleware function
 */
const requireRole = (roleName) => {
    return (req, res, next) => {
        //check if user is logged in first
        if (!req.session || !req.session.user) {
            req.flash('error', 'You must be logged in to access this page.');
            return res.redirect('/login');
        }

        // Check role
        if (roleName === 'employee' && req.session.user.roleName !== 'employee' && req.session.user.roleName !== 'admin') {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }

        if (roleName === 'admin' && req.session.user.roleName !== 'admin') {
            req.flash('error', 'You do not have permission to access this page.');
            return res.redirect('/');
        }

        // User has permission, proceed
        next();
    };
};

export { requireRole };