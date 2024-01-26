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
const { response } = require('express');

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
    const { code, courseID } = req.body;
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decodedToken.id);
    const course = await Course.findOne({ courseCode: courseID })
    const isCodeMatch = course.code === code;
    if (!isCodeMatch) {
      return res.status(400).json({ message: 'Invalid Code' });
    }
    const isAlreadyJoined = student.course.includes(courseID);
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
    const { token } = req.body;

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const student = await Student.findById(decodedToken.id);
    const course = await Course.findById(courseID);
    const session = await Session.findOne({ code: code, course: course });
    if (!session) {
      return res.status(400).json({ message: 'Invalid Code' });
    }
    if (session.status === 'off') {
      return res.status(400).json({ message: 'Session is off' });
    }

    if (networkInterface !== session.networkInterface) {
      return res.status(400).json({ message: 'Invalid Network Interface' });
    }

    const browser = mdns.createBrowser(mdns.tcp('http'), { resolverSequence: [mdns.rst.DNSServiceResolve(), 'DNSServiceGetAddrInfo'] }, { networkInterface: networkInterface });
    browser.on('serviceUp', async (service) => {
      if (service.name === courseID) {
        const teacherIPAddress = service.addresses[0];
        const teacherPort = service.port;

        // switch to tcp after mdns discovery
        const tcp_client = new net.Socket();
        tcp_client.connect(teacherPort, teacherIPAddress, async () => {
          console.log('Connected to teacher');
          const data_to_send = {
            studentID: student._id,
            studentLocation: studentLocation,
            code: code,
            sessionID: session._id,
          };
          tcp_client.write(JSON.stringify(data_to_send));
        });
        tcp_client.on('data', async (data) => {
          console.log(`Received data from teacher: ${data}`);
          const responseData = JSON.parse(data);
          if(responseData.success) {
            const distance = Math.sqrt((Math.pow(session.teacherLocation.latitude - responseData.studentLocation.latitude, 2)) + (Math.pow(session.teacherLocation.longitude - responseData.studentLocation.longitude, 2)));
            const isWithinDistance = distance <= 0.05; // 50 meters
            const isSameCode = responseData.code === session.code; 
            if (isWithinDistance && isSameCode){
              const attendance = await Attendance.findOne({ session: session });
              if(attendance.students.includes(student)) {
                return res.status(400).json({ message: 'Already marked attendance' });
              }
              attendance.students.push(student);
              await attendance.save();
              return res.status(200).json({ message: 'Attendance marked successfully' });
            }
          }
          return res.status(400).json({ message: 'Can\'t mark attendance, contact your teacher' });
        })
        tcp_client.on('close', () => {
          console.log('Connection closed');
        })
      }
    })
    browser.start();

    setTimeout(() => {
      return res.status(400).json({ message: "Can't mark attendance, contact your teacher" });
    }, 10000);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { cemail, newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 12);  
    const student = Student.findOneAndReplace({ email: cemail }, { password: hashedPassword });
    console.log(student);
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
  const { token } = req.body;
  const { courseID } = req.body;
  const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  const student = await Student.findById(decodedToken.id);
  const course = await Course.find({ courseCode: courseID });
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
  return res.status(200).json({ totalSessions: totalSessions, attendedSessions: attendedSessions, attendance: mp });
}