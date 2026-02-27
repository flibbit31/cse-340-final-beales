// placeholder function name for main global middleware
const global = (req, res, next) => {
    // Give NODE_ENV to templates for websocket
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

    next();
}

export { global };