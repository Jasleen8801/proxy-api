const OTP = require('../models/otp');
const sendEmail = require('../utils/sendEmail');

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const code = Math.floor(100000 + Math.random() * 900000);
    const subject = 'Password Reset';
    const text = `Your password reset code is ${code}`;
    await sendEmail(email, subject, text);
    
      const otp = new OTP({
        email: email,
        otp: code,
      });
      await otp.save();
    return res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { code, email } = req.body;
    console.log(code, email);
    const otp = await OTP.findOne({ email: email });
    if (!otp) {
      return res.status(400).json({ message: 'Invalid Email' });
    }
    if (otp.startTime + 600000 < Date.now()) {
      return res.status(400).json({ message: 'OTP expired' });
    }
    console.log(otp);
    if (otp.otp !== code) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }
    otp.valid = false;
    await otp.save();
    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};