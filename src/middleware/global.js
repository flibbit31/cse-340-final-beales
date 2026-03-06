/**
 * Allow dynamic loading of styles and scripts
 */
const setHeadAssetsFunctionality = (res) => {
    res.locals.styles = [];
    res.locals.scripts = [];

    res.addStyle = (css, priority = 0) => {
        res.locals.styles.push({ content: css, priority });
    };

    res.addScript = (js, priority = 0) => {
        res.locals.scripts.push({ content: js, priority });
    };

    res.locals.renderStyles = () => {
        return res.locals.styles
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };

    res.locals.renderScripts = () => {
        return res.locals.scripts
            .sort((a, b) => b.priority - a.priority)
            .map(item => item.content)
            .join('\n');
    };
};

// placeholder function name for main global middleware
const global = (req, res, next) => {
    // Give NODE_ENV to templates for websocket
    res.locals.NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';

    // set up dynamic asset loading
    setHeadAssetsFunctionality(res);

    // session isLoggedIn variable for UI
    res.locals.isLoggedIn = false;
    if (req.session && req.session.user) {
        res.locals.isLoggedIn = true;
    }

    next();
}

export { global };