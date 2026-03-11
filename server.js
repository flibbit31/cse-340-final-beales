// imports
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

import { global } from './src/middleware/global.js';

import routes from './src/controllers/routes.js';

import { setupDatabase } from './src/models/setup.js';

// session imports
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import { caCert } from './src/models/db.js';
import { startSessionCleanup } from './src/utils/session-cleanup.js';

// flash import
import flash from './src/middleware/flash.js';

// testing imports
import { testProjectsModel } from './src/models/testing/testing.js';

/**
 * Server configuration
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

// express init
const app = express();

// session setup
const pgSession = connectPgSimple(session);

// session middleware
app.use(session({
    store: new pgSession({
        conObject: {
            connectionString: process.env.DB_URL,
            ssl: {
                ca: caCert,
                rejectUnauthorized: true,
                checkServerIdentity: () => { return undefined; }
            }
        },
        tableName: 'session',
        createTableIfMissing: true
    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUnitialized: false,
    cookie: {
        secure: NODE_ENV.includes('dev') !== true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

startSessionCleanup();

app.use(express.static(path.join(__dirname, 'public')));

// POST data setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// template config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Global middleware
app.use(global);

// Flash middleware
app.use(flash);

// Routes
app.use('/', routes);

// use websocket in development mode
if (NODE_ENV.includes('dev')) {
    const ws = await import('ws');

    try {
        const wsPort = parseInt(PORT) + 1;
        const wsServer = new ws.WebSocketServer({ port: wsPort });

        wsServer.on('listening', () => {
            console.log(`WebSocket server is running on port ${ wsPort }`);
        });

        wsServer.on('error', (error) => {
            console.error('WebSocket server error:', error);
        });
    }
    catch (error) {
        console.error('Failed to start WebSocket server:', error);
    }
}

// The rest of the errors are 404 errors
app.use((req, res, next) => {
    const err = new Error('Page Not Found');
    err.status = 404;
    next(err);
});

// Global error handler
app.use((err, req, res, next) => {
    // Prevent infinite loops
    if (res.headersSent || res.finished) {
        return next(err);
    }

    // Determine staus and template
    const status = err.status || 500;
    const template = status.toString();

    // Prepare data for the template
    const context = {
        //title:
        error: NODE_ENV === 'production' ? 'An error occured' : err.message,
        stack: NODE_ENV === 'production' ? null : err.stack,
        NODE_ENV
    };

    // Render error page
    try {
        res.status(status).render(`errors/${template}`, context);
    }
    catch (renderErr) {
        // If rendering fails, send a simple error page instead
        if (!res.headersSent) {
            res.status(status).send(`<h1>Error ${status}</h1><p>An error occured.</p>`);
        }
    }
});

// start server
app.listen(PORT, () => {
    setupDatabase();
    //testUsersModel();
    //testProjectsModel();
    console.log(`Server is running on port ${PORT}`);
});
