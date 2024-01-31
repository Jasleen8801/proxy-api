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
  createdAt: {
    type: Date,
    default: Date.now,
  },
  serial: {
    type: Number,
    unique: true,
    autoIncrement: true,
  },
});

module.exports = mongoose.model('Teacher', TeacherSchema);