const path = require('path');
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../database/db');
const { log, logError } = require('../utils/logger');
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();
const PNF = require('google-libphonenumber').PhoneNumberFormat;
const { check, validationResult } = require('express-validator');
const { render } = require('../app');
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
    check('password').notEmpty().withMessage('Please provide your account password')
], async (req, res) => {
    const { email, password } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).render('auth/login', {
            errors: errors.array(),
            email: req.body.email
        });
    }
    try {
        const [userInformation] = await pool.query('SELECT email,password_hash FROM patients WHERE email=?', [email]);
        if (userInformation.length === 0) {
            res.status(400).render('auth/login', {
                errors: [{ msg: 'No user Invalid email or password' }],
                email: req.body.email
            });
        }
        const user = userInformation[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).render('auth/login', {
                errors: [{ msg: 'Invalid:  email or password' }],
                email: req.body.email
            })
        }
        req.session.user = {
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name
        };
        res.redirect('/auth/dashboard');
    } catch (error) {
        logError(`Error during login: ${error.message}`);
        res.status(500).send('Internal Server Error Occurred when signing you in, check back later')
    }
});
router.post('/logout', (req, res) => {

});
router.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/auth/login');
    }
    const firstName = req.session.user.firstName;
    res.render('dashboard/index', { firstName });
});
module.exports = router