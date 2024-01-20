const express = require("express")
const router = express.Router()

const { postLogin, getTeacher, createCourse, createSession } = require("../controllers/teacher")

router.post("/login", postLogin)
router.get("/", getTeacher)
router.post("/create-course", createCourse)
router.post("/create-session", createSession)

module.exports = router