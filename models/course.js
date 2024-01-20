const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CourseSchema = new Schema({
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
  batch: {
    type: String,
    required: true,
  },
  totalNoOfClasses: {
    type: Number,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Course', CourseSchema);