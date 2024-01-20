const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const Teacher = require('../models/teacher');
const Course = require('../models/course');
const Session = require('../models/session');
const Attendance = require('../models/attendance');
const createToken = require('../middlewares/teacherCreateToken');
const getBSSID = require('../middlewares/getBSSID');

exports.postLogin = async (req, res) => {
  try {
    const userData = req.body;

    const existingUser = await Teacher.findOne({ email: userData.email });
    if (!existingUser) {
      return res.status(400).json({ message: 'Email does not exists' });
    }

    const isPasswordCorrect = await bcrypt.compare(
      userData.password,
      existingUser.password
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const token = createToken(existingUser);
    return res.status(200).json({ token: token, message: 'Logged in successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.getTeacher = async (req, res) => {
  try {
    const { token } = req.body;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decodedToken.id);
    return res.status(200).json({ teacher: teacher, message: 'Fetched data successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const { token } = req.body;
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decodedToken.id);
    courseData.teacher = teacher;

    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    
    const course = new Course({
      ...courseData,
      code: code,
    });
    await course.save();
    
    return res.status(200).json({ message: 'Course created successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.createSession = async (req, res) => {
  try {
    const { courseID, teacherIPAddress, status, location } = req.body;

    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;

    const course = await Course.findById(courseID);
    if (!course) {
      return res.status(400).json({ message: 'Course does not exists' });
    }

    const teacherBSSID = await getBSSID(teacherIPAddress);

    const session = new Session({
      course: course,
      code: code,
      teacherIPAddress: teacherIPAddress,
      status: status,
      teacherBSSID: teacherBSSID,
      location: location,
    });
    await session.save();

    const attendance = new Attendance({
      session: session,
      students: [],
    });
    await attendance.save();

    return res.status(200).json({ message: 'Session created successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}