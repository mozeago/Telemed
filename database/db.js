require('dotenv').config();
const mysql = require('mysql2');
const log = require('../utils/logger');
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
connection.connect((error) => {
    if (error) {
        log(`Error Connecting to Database: ${error.message}`);
        return;
    }
    log('Connected to DB!');
});
module.exports = connection;