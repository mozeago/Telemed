const path = require('path');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database/db');
const { log, logError } = require('../utils/logger');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;
router.get('/register', (req, res) => {
    res.render('auth/register');
});
router.post('/register', async (req, res) => {
    const { first_name, last_name, email, password, phone, date_of_birth, gender, street, city, state, postal_code, country } = req.body;
    try {
        const number = phoneUtil.parse(phone);
        // if (!phoneUtil.isValidNumber(number)) {
        //     return res.status(400).send('Invalid phone number format');
        // }
        const formattedPhone = phoneUtil.format(number, PNF.E164);
        const queryStatement = 'INSERT INTO patients (first_name, last_name, email, password_hash, phone, date_of_birth, gender,address) VALUES (?, ?, ?, ?, ?, ?, ?,?)';
        const hashedPassword = await bcrypt.hash(password, 10);
        const address = `${street}, ${city}, ${state}, ${postal_code}, ${country}`;
        const values = [first_name, last_name, email, hashedPassword, formattedPhone, date_of_birth, gender, address];
        const [result] = await pool.execute(queryStatement, values);
        res.render('auth/details', {
            first_name,
            last_name,
            email, hashedPassword,
            phone: formattedPhone,
            date_of_birth,
            gender
        });
    } catch (error) {
        logError(`Error inserting data into the database: ${error.message}
        Stack: ${error.stack}`);
        res.status(500).send('Internal Server Error');
    }
});
router.get('/login', (req, res) => {

});
router.post('/logout', (req, res) => {

});
module.exports = router