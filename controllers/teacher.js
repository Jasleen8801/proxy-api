const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const portfinder = require('portfinder');
const dotenv = require('dotenv');
dotenv.config();

const Teacher = require('../models/teacher');
const Course = require('../models/course');
const Session = require('../models/session');
const Attendance = require('../models/attendance');
const Student = require('../models/student');
const Sheet = require('../models/sheets');
const Location = require('../models/location');
const createToken = require('../middlewares/teacherCreateToken');
const createGoogleSheet = require('../utils/createGoogleSheet');
const updateGoogleSheet = require('../utils/updateGoogleSheet');
const { startSocketServer, stopSocketServer } = require('../socket/server/app');

exports.postLogin = async (req, res) => {
  try {
    const userData = req.body;
    // {email, password}

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

exports.getCourses = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; 
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decodedToken.id);
    const courses = await Course.find({ teacher: teacher });
    return res.status(200).json({ courses: courses, message: 'Fetched data successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.createCourse = async (req, res) => {
  try {
    const courseData = req.body;
    const token = req.headers.authorization.split(' ')[1];
    
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

    teacher.courses.push(course);
    await teacher.save();
    
    return res.status(200).json({ message: 'Course created successfully', code: code });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const teacher = await Teacher.findOne({ email: email });
    teacher.password = hashedPassword;
    await teacher.save();
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const { courseCode } = req.body;
    const course = await Course.findOne({ courseCode: courseCode });
    const students = await Student.find({ course: course });
    return res.status(200).json({ students: students, message: 'Fetched data successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacherData = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findByIdAndUpdate(decodedToken.id, teacherData, { new: true });
    await teacher.save();
    return res.status(200).json({ message: 'Teacher updated successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.createSession = async (req, res) => {
  try {
    const { courseID, location, networkInterface } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const teacher = await Teacher.findById(decodedToken.id);

    const port = await portfinder.getPortPromise();

    const sessionObj = {
      name: courseID,
      teacherID: teacher._id,
      networkInterface: networkInterface,
      port: port,
    };

    startSocketServer(sessionObj);

    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;

    const course = await Course.findOne({ courseCode: courseID });
    // console.log(courseID,course);
    if (!course) {
      stopSocketServer(sessionObj);
      return res.status(400).json({ message: 'Course does not exists' });
    }

    const loc = new Location({
      latitude: location.latitude,
      longitude: location.longitude,
    });
    await loc.save();

    const session = new Session({
      course: course,
      code: code,
      teacherLocation: loc,
      networkInterface: networkInterface,
      port: port,
    });
    await session.save();

    const attendance = new Attendance({
      session: session,
      students: [],
    });
    await attendance.save();

    return res.status(200).json({ message: 'Session created successfully', code: code });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.markAttendance = async (req, res) => {
  try {
    const { studentRollNo, courseId } = req.body;
    const course = await Course.find({ courseCode: courseId });
    const student = await Student.find({ rollNo: studentRollNo });
    const session = await Session.find({ course: course, status: 'on' });
    const attendance = await Attendance.find({ session: session });
    attendance.students.push(student);
    await attendance.save();
    return res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.log(error);
  }
};

exports.stopSession = async (req, res) => {
  try {
    const { sessionCode } = req.body;
    const session = await Session.findOne({ code: sessionCode, status: 'on' });
    session.status = 'off';
    await session.save();
    return res.status(200).json({ message: 'Session stopped successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const { courseCode } = req.body;
    const course = await Course.findOne({ courseCode: courseCode });
    const session = await Session.find({ course: course, status: 'off' });
    const mp = new Map(); 
    for (let i=0; i<session.length; i++){
      const attendance = await Attendance.findOne({ session: session[i] });
      const students = attendance.students;
      for (let j=0; j<students.length; j++){
        const key = `${students[j].rollNo}_${session[i].startTime}`;
        mp.set(key, 'present');
      }
    }
    return res.status(200).json({ attendance: mp, message: 'Fetched data successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAttendanceByDate = async (req, res) => {
  try {
    const { courseCode, date } = req.body;
    const course = await Course.findOne({ courseCode: courseCode });
    const session = await Session.find({ course: course, status: 'off' });
    const mp = new Map();
    for (let i=0; i<session.length; i++){
      const attendance = await Attendance.findOne({ session: session[i] });
      const students = attendance.students;
      for (let j=0; j<students.length; j++){
        mp.set(students[j].rollNo, 'present');
      }
    }
    return res.status(200).json({ attendance: mp });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.getSheet = async (req, res) => {
  try {
    const { courseCode } = req.body;
    const course = await Course.findOne({ courseCode: courseCode });
    const attendance = await Attendance.find({ course: course });
    if(attendance){
      const spreadsheetId = attendance.spreadsheetId;
      const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
      return res.status(200).json({ url: url, message: 'Fetched data successfully' });
    }

    const API_URL = `${process.env.NODESERVER}/${process.env.PORT}`;
    const res = axios.post(`${API_URL}/teacher/attendance`, {
      courseCode: courseCode,
    });
    const mp = res.data.attendance;

    let spreadsheetId = createGoogleSheet(`${courseCode} Attendance`);
    spreadsheetId = updateGoogleSheet(spreadsheetId, mp);
    const sheet = new Sheet({
      course: course,
      spreadsheetId: spreadsheetId,
    });
    await sheet.save();

    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
    return res.status(200).json({ url: url, message: 'Fetched data successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};