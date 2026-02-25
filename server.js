// imports
import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';

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

// start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
