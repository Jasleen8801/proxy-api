const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async (email, subject, text) => {
  try {
    const email = process.env.EMAIL;
    const password = process.env.EMAIL_PASSWORD;
    console.log(email, password);
    const transporter = nodemailer.createTransport({
      host: "smtp.forwardemail.net",
      port: 465,
      secure: true,
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

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.log(error);
  }
}

module.exports = sendEmail;