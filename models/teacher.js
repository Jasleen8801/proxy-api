const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TeacherSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String, 
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  courses: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
  ],
  macAddress: {
    type: String,
    unique: true,
  },
});

module.exports = mongoose.model('Teacher', TeacherSchema);