const express = require('express');
const router = express.Router();

const { postSignup, postLogin, getStudent, joinCourse, updateStudent, markAttendance, changePassword, resetPassword, getAttendance, getCourses } = require('../controllers/student');
const { sendOTP, verifyOTP } = require('../controllers/mailer');

router.post('/signup', postSignup); //tested
router.post('/login', postLogin); //tested
router.get('/', getStudent); //tested
router.post('/join-course', joinCourse); //tested
router.put('/update', updateStudent); //tested
router.post('/change-password', changePassword); //tested
router.post('/send-otp', sendOTP); //tested
router.post('/verify-otp', verifyOTP); //tested
router.post('/mark-attendance', markAttendance);
router.post('/reset-password', resetPassword); // FIXME: 
router.get('/attendance', getAttendance);
router.get('/courses', getCourses);

module.exports = router;