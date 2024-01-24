const express = require("express")
const router = express.Router()

const { postSignup, postLogin, createTeacher, getAllTeachers } = require("../controllers/admin")

// router.post("/signup", postSignup)
router.post("/login", postLogin) //tested
router.post("/create-teacher", createTeacher) //tested
router.get("/teachers", getAllTeachers) //tested

module.exports = router