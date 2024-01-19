const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ConnectToDB = async () => {
  try {
    await mongoose
      .connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('Successfully connected to MongoDB.');
      });
  } catch (error) {
    console.log(error);
  }
};

module.exports = ConnectToDB;