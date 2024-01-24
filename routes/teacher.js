const express = require("express")
const router = express.Router()

const { postLogin, getTeacher, createCourse, createSession, resetPassword, updateTeacher, markAttendance, stopSession, getAttendance, getAttendanceByDate, getSheet, getAllStudents } = require("../controllers/teacher")
const { sendOTP, verifyOTP } = require('../controllers/mailer');

router.post("/login", postLogin) //tested
router.get("/", getTeacher) //tested
router.post("/create-course", createCourse) //tested
router.post('/send-otp', sendOTP); //tested
router.post('/verify-otp', verifyOTP); //tested
router.put('/update', updateTeacher); //tested
router.post('/reset-password', resetPassword); //FIXME:
router.get('/students', getAllStudents); //tested
router.post("/create-session", createSession); //tested
router.post('/mark-attendance', markAttendance);
router.post('/stop-session', stopSession);
router.get('/attendance', getAttendance);
router.get('/attendance-by-date', getAttendanceByDate);
router.get('/sheet', getSheet);

module.exports = router