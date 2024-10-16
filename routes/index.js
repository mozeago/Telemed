const connection = require('../database/db');
const express = require('express');
const router = express.Router();
const log = require('../utils/logger');

/* GET home page. */
router.get('/', function (req, res, next) {
  connection.query('SELECT * FROM patients', (error, results) => {
    if (error) {
      log(`Database query failed: ${error.message}`);
      return res.status(500).send('A server error occurred while processing your request. Please try again later.');
    }
    res.render('index', { title: 'Telemed', patients: results });
  })
});

module.exports = router;
