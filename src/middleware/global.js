// placeholder function name for main global middleware
const global = (req, res, next) => {
    // Give NODE_ENV to templates for websocket
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

    // session isLoggedIn variable for UI
    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }

    next();
}

export { global };