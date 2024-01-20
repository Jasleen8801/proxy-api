const express = require("express")
const router = express.Router()

const { postLogin, getTeacher, createCourse, createSession, resetPassword, updateTeacher, markAttendance, stopSession, getAttendance, getAttendanceByDate, getSheet } = require("../controllers/teacher")
const { sendOTP, verifyOTP } = require('../controllers/mailer');

router.post("/login", postLogin)
router.get("/", getTeacher)
router.post("/create-course", createCourse)
router.post("/create-session", createSession)
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/reset-password', resetPassword);
router.put('/update-teacher', updateTeacher);
router.post('/mark-attendance', markAttendance);
router.post('/stop-session', stopSession);
router.get('/attendance', getAttendance);
router.get('/attendance-by-date', getAttendanceByDate);
router.get('/sheet', getSheet);

module.exports = router