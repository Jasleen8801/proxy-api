const express = require('express');
const router = express.Router();

const { postSignup, postLogin, getStudent } = require('../controllers/student');

router.post('/signup', postSignup);
router.post('/login', postLogin);
router.get('/', getStudent);

module.exports = router;