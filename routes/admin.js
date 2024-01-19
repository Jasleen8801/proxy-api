const express = require("express")
const router = express.Router()

const { postSignup, postLogin, createTeacher } = require("../controllers/admin")

// router.post("/signup", postSignup)
router.post("/login", postLogin)
router.post("/create-teacher", createTeacher)

module.exports = router