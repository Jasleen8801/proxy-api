const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mdns = require('mdns');
const net = require('net');
const dotenv = require('dotenv');
dotenv.config();

const Student = require('../models/student');
const Course = require('../models/course');
const Session = require('../models/session');
const Attendance = require('../models/attendance');
const createToken = require('../middlewares/studentCreateToken');
const { startSocketClient } = require('../socket/client/app');

exports.postSignup = async (req, res) => {
  try {
    const userData = req.body;

    const existingUser = await Student.findOne({ rollNo: userData.rollNo });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const student = new Student({ ...userData, password: hashedPassword });
    await student.save();

    return res.status(200).json({ message: 'User created successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.postLogin = async (req, res) => {
  try {
    const userData = req.body;
    console.log(userData);

    const existingUser = await Student.findOne({ email: userData.email });
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
};

exports.getStudent = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; 
    // console.log(token);
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decodedToken.id);
    return res.status(200).json({ student: student, message: 'Fetched data successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Bearer <token>
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const updatedData = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(decodedToken.id, updatedData, { new: true }); 
    return res.status(200).json({ message: 'Updated successfully', student: updatedStudent });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.changePassword = async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];   
    const { oldPassword, newPassword } = req.body;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decodedToken.id);
    
    const isPasswordCorrect = await bcrypt.compare(oldPassword, student.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    student.password = hashedPassword;
    await student.save();
    
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }

}

exports.joinCourse = async (req, res) => {
  try {
    const { code } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decodedToken.id);
    const course = await Course.findOne({ code: code });
    if (!course) {
      return res.status(400).json({ message: 'Invalid Code' });
    }
    const isAlreadyJoined = student.course.includes(course);
    if (isAlreadyJoined) {
      return res.status(400).json({ message: 'Already Joined' });
    }
    student.course.push(course);
    await student.save();
    
    course.students.push(student);
    await course.save();

    return res.status(200).json({ message: 'Joined successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.markAttendance = async (req, res) => {
  try {
    const { code, courseID, studentLocation, networkInterface } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decodedToken.id);
    const course = await Course.findOne({courseCode: courseID});
    const session = await Session.findOne({ code: code, course: course });
    if (!session) {
      return res.status(202).json({ message: 'Invalid Code' });
    }
    if (session.status === 'off') {
      return res.status(201).json({ message: 'Session is off' });
    }

    const bssidOfTeacher = session.bssid;
    const bssidOfStudent = networkInterface;
    if (bssidOfTeacher !== bssidOfStudent) {
      return res.status(203).json({ message: 'Invalid Network' });
    }

    const distance = Math.sqrt(Math.pow(session.teacherLocation.latitude - studentLocation.latitude, 2) + Math.pow(session.teacherLocation.longitude - studentLocation.longitude, 2));
    const isWithinDistance = distance <= 0.01; // 50 meters
    const isSameCode = code === session.code;

    if(isWithinDistance && isSameCode){
      const attendance = await Attendance.findOne({ session: session });
      if(attendance.students.includes(student)) {
        return res.status(204).json({ message: 'Already marked attendance' });
      }
      attendance.students.push(student);
      await attendance.save();
      return res.status(200).json({ message: 'Attendance marked successfully' });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.markAttendance2 = async (req, res) => {
  try {
    const { code, courseID, studentLocation, networkInterface } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decodedToken.id);
    const course = await Course.findOne({courseCode: courseID});
    const session = await Session.findOne({ code: code, course: course });
    if (!session) {
      return res.status(202).json({ message: 'Invalid Code' });
    }
    if (session.status === 'off') {
      return res.status(201).json({ message: 'Session is off' });
    }

    const data = {
      studentID: student._id,
      studentLocation: studentLocation,
      code: code,
      sessionID: session._id,
      bssidOfStudent: networkInterface,
      bssidOfTeacher: session.bssid
    };

    startSocketClient(session.port, data); 

    return res.status(200).json({ message: 'Attendance marked successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Couldn\'t mark attendance. Contact your teacher.' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { cemail, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 12);  
    const student = await Student.findOne({ email: cemail });
    student.password = hashedPassword;
    await student.save();
    // console.log(student);
    if(!student) {
      return res.status(400).json({ message: 'Invalid Email' });
    }
    return res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.getAttendance = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const { courseID } = req.body;
  const student = await Student.findById(decodedToken.id);
  const course = await Course.find({ courseCode: courseID });
  const total = course.totalNoOfClasses;
  const session = await Session.find({ course: course, status: 'off' });
  let totalSessions = session.length;
  let attendedSessions = 0;
  const mp = new Map();
  for (let i = 0; i < totalSessions; i++) {
    const attendance = await Attendance.find({ session: session[i] });
    if (attendance.students.includes(student)) {
      attendedSessions++;
      mp.set(session[i].date, 'present');
    } else {
      mp.set(session[i].date, 'absent');
    }
  }
  const leftSessions = total - totalSessions;
  return res.status(200).json({ totalSessions: totalSessions, attendedSessions: attendedSessions, attendance: mp, leftSessions: leftSessions, message: 'Fetched data successfully'});
}

exports.getCourses = async (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const student = await Student.findById(decodedToken.id);
  const courses = await Course.find({ students: student });
  return res.status(200).json({ courses: courses, message: 'Fetched data successfully'});
}