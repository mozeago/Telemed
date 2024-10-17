const path = require('path');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database/db');
const { log, logError } = require('../utils/logger');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const { check, validationResult } = require('express-validator');
const { render } = require('app');
router.get('/register', (req, res) => {
    res.render('auth/register');
});
router.post('/register', [
    check('first_name').notEmpty().withMessage('First name is required'),
    check('last_name').notEmpty().withMessage('Last name is required'),
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    check('phone').notEmpty().withMessage('Phone number is required'),
    check('date_of_birth').notEmpty().withMessage('Date of birth is required'),
    check('gender').notEmpty().withMessage('Gender is required'),
    check('street').notEmpty().withMessage('Street address is required'),
    check('city').notEmpty().withMessage('City is required'),
    check('state').notEmpty().withMessage('State is required'),
    check('postal_code').notEmpty().withMessage('Postal code is required'),
    check('country').notEmpty().withMessage('Country is required')
], async (req, res) => {
    const { first_name, last_name, email, password, phone, date_of_birth, gender, street, city, state, postal_code, country } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('auth/register', {
            errors: errors.array(),
            first_name,
            last_name,
            email,
            phone,
            date_of_birth,
            gender,
            street,
            city,
            state,
            postal_code,
            country
        })
    }
    try {
        const number = phoneUtil.parse(phone);
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
    res.render('auth/login', { errors: [], email: '' });

});
router.post('/login', [
    check('email').notEmpty().isEmail().withMessage('Please provide valid email'),
    check('password').notEmpty().isPassword().withMessage('Please provide your account password')
], async (req, res) => {
    const { email, password } = res.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('auth/login', {
            errors: errors.array(),
            email: res.body.email
        });
    }
    try {

    } catch (error) {
        logError(`Error during login: ${error.message}`);
        res.status(500).send('Internal Server Error Occured when loggin you in, check back later')
    }
});
router.post('/logout', (req, res) => {

});
module.exports = router