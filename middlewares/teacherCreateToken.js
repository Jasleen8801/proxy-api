const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const teacherCreateToken = (teacher) => {
  const token = jwt.sign(
    {
      userName: teacher.userName,
      id: teacher._id,
    },
    process.env.JWT_SECRET
  );
  return token;
}

module.exports = teacherCreateToken;