import db from '../models/db.js';

/**
 * Removes expired session from the database
 */
const cleanupExpiredSessions = async () => {
    try {
        const result = await db.query(
            `DELETE FROM session WHERE expire < NOW()`
        );

        if (result.rowCount > 0) {
            console.log(`Cleaned up ${result.rowCount} expired sessions`); 
        }
    }
    catch (error) {
        if (error.code === '42P01') {
            console.log('Session table does not exist yet:\nIt will be created when the first session is initialized.');
            return;
        }

        console.error('Error cleaning up sessions:', error);
    }
};

/**
 * Starts automatic session cleanup that runs every 24 hours.
 * Runs immediately on startup to handle any sessions that expired while server was offline.
 */
const startSessionCleanup = () => {
    cleanupExpiredSessions();

    // Run cleanup every 12 hours
    const twelveHours = 12 * 60 * 60 * 1000;
    setInterval(cleanupExpiredSessions, twelveHours);

    console.log('Session cleanup scheduled to run every 12 hours');
};

export { startSessionCleanup };