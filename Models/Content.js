const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  pageType: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true }
}, { timestamps: true });

const Content = mongoose.model('Content', schema);

module.exports = Content;
