const Attendance = require('../models/attendance');
const Student = require('../models/student');
const Session = require('../models/session');

const markAttendance = async (data) => {
  try {
    const session = await Session.findById(data.sessionID);
    const student = await Student.findById(data.studentID);
    const distance = Math.sqrt(Math.pow(session.teacherLocation.latitude - data.studentLocation.latitude, 2) + Math.pow(session.teacherLocation.longitude - data.studentLocation.longitude, 2));
    const isWithinDistance = distance <= 0.05; // 50 meters
    const isSameCode = data.code === session.code;

    if(isWithinDistance && isSameCode) {
      const attendance = await Attendance.findOne({ session: session });
      if(attendance.students.includes(data.studentID)) {
        return { success: false, message: 'Already marked attendance' };
      }
      attendance.students.push(data.student);
      await attendance.save();
      return { success: true, message: 'Attendance marked successfully' };
    }
    return { success: false, message: 'Can\'t mark attendance, contact your teacher' };
  } catch (error) {
    console.log(error)
  }
}

module.exports = markAttendance;