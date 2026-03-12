// flash middleware for creating flash messages for users

const flashMiddleware = (req, res, next) => {
    let sessionNeedsSave = false;

    const originalRedirect = res.redirect.bind(res);
    res.redirect = (...args) => {
        if (sessionNeedsSave && req.session) {
            req.session.save(() => {
                originalRedirect.apply(res, args);
            });
        }
        else {
            originalRedirect.apply(res, args);
        }
    };

    // create flash function
    req.flash = function(type, message) {
        if (!req.session) {
            if (type && message) {
                return;
            }

            return { success: [], error: [], warning: [], info: [] };
        }

        //initialize flash storage if it doesn't exist
        if (!req.session.flash) {
            req.session.flash = {
                success: [],
                error: [],
                warning: [],
                info: []
            };
        }

        // store a message
        if (type && message) {
            if (!req.session.flash[type]) {
                req.session.flash[type] = [];
            }

            req.session.flash[type].push(message);

            sessionNeedsSave = true;
            return;
        }

        // retrive messages of type
        if (type && !message) {
            const messages = req.session.flash[type] || [];
            req.session.flash[type] = [];
            return messages;
        }

        // get messages of all types if there are no arguments
        const allMessages = req.session.flash || {
            success: [],
            error: [],
            warning: [],
            info: []
        };

        // clear messages before retrieval
        req.session.flash = {
            success: [],
            error: [],
            warning: [],
            info: []
        };

        return allMessages;
    };

    next();
};

const flashLocals = (req, res, next) => {
    // make flash function available to locals
    res.locals.flash = req.flash;
    next();
};

// set up flash 
const flash = (req, res, next) => {
    flashMiddleware(req, res, () => {
        flashLocals(req, res, next);
    });
};

export default flash;