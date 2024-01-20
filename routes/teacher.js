const express = require("express")
const router = express.Router()

const { postLogin, getTeacher, createCourse } = require("../controllers/teacher")

router.post("/login", postLogin)
router.get("/", getTeacher)
router.post("/create-course", createCourse)

module.exports = router