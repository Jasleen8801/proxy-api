const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async (email, subject, text) => {
  try {
    const password = process.env.EMAIL_PASSWORD;
    // console.log(email, password);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      name: process.env.EMAIL_USERNAME,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: subject,
      text: text,
    };

    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent successfully: ' + info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendEmail;