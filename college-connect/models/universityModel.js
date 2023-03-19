const mongoose = require('mongoose');

UniversitySchema = new mongoose.Schema({
  creator:{
    type: String
  },
  name: {
    type:String,
    required: true,
    trim: true,
    minlength:1,
    unique: true
  },
  shortName:{
    type: String,
    trim:true,
    unique: true
  },
  departments:[String],
  status:{
    type: String,   // active, trial
  },
  address:{
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  file: [{
    fileId:{
      type: String
    }
  }
  ],
  picture: {
    type: String
  },
  createdOn:{
    type: Number
  }
});

var University = mongoose.model('University', UniversitySchema);

module.exports = {University}
