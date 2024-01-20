const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OTPSchema = new Schema({
  otp: {
    type: String,
    required: true,
  },
  valid: {
    type: Boolean,
    default: true,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  email: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('OTP', OTPSchema);