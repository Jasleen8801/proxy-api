const express = require('express');
const router = express.Router();

const { postSignup, postLogin, getStudent, joinCourse, updateStudent, markAttendance, changePassword, resetPassword, getAttendance } = require('../controllers/student');
const { sendOTP, verifyOTP } = require('../controllers/mailer');

router.post('/signup', postSignup);
router.post('/login', postLogin);
router.get('/', getStudent);
router.post('/join-course', joinCourse);
router.put('/update', updateStudent);
router.post('/mark-attendance', markAttendance);
router.post('/change-password', changePassword);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.get('/attendance', getAttendance);

module.exports = router;