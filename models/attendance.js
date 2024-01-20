const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AttendanceSchema = new Schema({
  session: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
});

module.exports = mongoose.model('Attendance', AttendanceSchema);