const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const Admin = require('../models/admin');
const Teacher = require('../models/teacher');
const createToken = require('../middlewares/adminCreateToken');

exports.postSignup = async (req, res) => {
  try {
    const userData = req.body;

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const admin = new Admin({ ...userData, password: hashedPassword });
    await admin.save();

    return res.status(200).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.postLogin = async (req, res) => {
  try {
    const userData = req.body;
    
    const existingUser = await Admin.findOne({ email: userData.email });
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

exports.createTeacher = async (req, res) => {
  try {
    const teacherData = req.body;
    
    const hashedPassword = await bcrypt.hash(teacherData.password, 12);
    const teacher = new Teacher({ ...teacherData, password: hashedPassword });
    await teacher.save();

    return res.status(200).json({ message: 'Teacher created successfully' });
  } catch (error) {
    console.log(error); 
    return res.status(500).json({ message: 'Server Error' });
  }
}

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.find();
    return res.status(200).json({ teachers: teachers });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
}