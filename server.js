// imports
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

import { global } from './src/middleware/global.js';

import routes from './src/controllers/routes.js';

import { setupDatabase } from './src/models/setup.js';

// testing imports
import { testUsersModel } from './src/models/testing/users.js';

// environment setup
const NODE_ENV = process.env.NODE_ENV?.toLowerCase() || 'production';
const PORT = process.env.PORT || 3000;

// express init
const app = express();

// POST data setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// file/dir setup
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// template config
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Global middleware
app.use(global);

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
    testUsersModel();
    console.log(`Server is running on port ${PORT}`);
});
