const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const StudentCreateToken = (student) => {
  const token = jwt.sign(
    {
      userName: student.userName,
      id: student._id,
    },
    process.env.JWT_SECRET
  );
  return token;
};

module.exports = StudentCreateToken;