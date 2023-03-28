const mongoose = require('mongoose');

var VoteSchema = new mongoose.Schema({
  voter : String,
  voteType : String,
  timestamp : String,
  itemId : String
});

var Vote = mongoose.model('Vote', VoteSchema);

module.exports = {Vote}
