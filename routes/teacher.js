const express = require("express")
const router = express.Router()

const { postLogin, getTeacher } = require("../controllers/teacher")

router.post("/login", postLogin)
router.get("/", getTeacher)

module.exports = router