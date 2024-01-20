const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LocationSchema = new Schema({
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number, 
    required: true,
  },
})

module.exports = mongoose.model('Location', LocationSchema);