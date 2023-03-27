const mongoose = require('mongoose');

var ViewSchema = new mongoose.Schema({
  time : Number,
  pageId : String,
  pageType : String,
  university : String,
  ip : String,
  user : String
});

var View = mongoose.model('View', ViewSchema);

module.exports = {View}
