const LocationSchema = require('./location').schema;
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
  },
  code: {
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['on', 'off'],
    default: 'on',
  },
  teacherLocation: LocationSchema,
  networkInterface: {
    type: String,
    required: true,
  },
  port: {
    type: Number,
    // required: true,
  },
});

module.exports = mongoose.model('Session', SessionSchema);