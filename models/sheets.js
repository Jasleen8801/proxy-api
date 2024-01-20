const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SheetSchema = new Schema({
  course: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
  },
  spreadSheetId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Sheet', SheetSchema);