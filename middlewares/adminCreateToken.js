const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

const AdminCreateToken = (admin) => {
  const token = jwt.sign(
    {
      userName: admin.userName,
      id: admin._id,
    }, 
    process.env.JWT_SECRET
  );
  return token;
};

module.exports = AdminCreateToken;