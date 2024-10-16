const pool = require('../database/db');
const express = require('express');
const router = express.Router();
const { log, logError } = require('../utils/logger');
const { title } = require('process');

/* GET home page. */
router.get('/', async (req, res, next) => {
    try {
        const [results] = await pool.query('SELECT * FROM patients');
        res.render('index', { title: 'Telemed V1.0.0', patients: results });
    } catch (error) {
        logError(`Database query failed: ${error.message}`);
        res.status(500).send('A server error occurred while processing your request.');
    }
});

module.exports = router;
