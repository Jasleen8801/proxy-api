const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String, 
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  rollNo: {
    type: Number,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  course: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Course',
    },
  ]
})

module.exports = mongoose.model('Student', StudentSchema);