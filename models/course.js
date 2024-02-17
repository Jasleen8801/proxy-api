const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
  serial: {
    type: Number,
    unique: true,
  },
  courseName: {
    type: String,
    required: true,
  },
  courseCode: {
    type: String,
    required: true,
  },
  students: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Student',
    },
  ],
  teacher: {
    type: Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  totalNoOfClasses: {
    type: Number,
    required: true,
    default: 30,
  },
  code: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Course', CourseSchema);