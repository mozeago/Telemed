const fs = require('fs').promises;
const path = require('path');

const logFilePath = path.join(__dirname, '../logs', 'app.log');

(async () => {
    try {
        await fs.mkdir(path.dirname(logFilePath), { recursive: true });
    } catch (err) {
        console.error('Failed to create log directory:', err);
    }
})();

const log = async (message) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;

    try {
        await fs.appendFile(logFilePath, logMessage);
    } catch (err) {
        console.error('Failed to write to log file:', err);
    }
};

const logError = async (error) => {
    const timestamp = new Date().toISOString();
    const errorMessage = `${timestamp} - ERROR: ${error.stack || error}\n`; // Capture stack trace if available

    try {
        await fs.appendFile(logFilePath, errorMessage);
    } catch (err) {
        console.error('Failed to write error to log file:', err);
    }
};
process.on('uncaughtException', async (error) => {
    await logError(`Uncaught Exception: ${error}`);
    process.exit(1);
});

process.on('unhandledRejection', async (reason, promise) => {
    await logError(`Unhandled Rejection at: ${promise} - reason: ${reason}`);
});

module.exports = { log, logError };
