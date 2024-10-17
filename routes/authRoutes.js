const path = require('path');
const express = require('express');
const router = express.Router();
router.get('/auth/register', (req, res) => {
    res.send('Registration');
    // res.sendFile(path.resolve(__dirname, '../views//auth//register.html'));
});
router.get('/login', (req, res) => {

});
router.post('/logout', (req, res) => {

});
module.exports = router