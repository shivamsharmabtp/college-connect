const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
    unique: true,
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  accessLevel: {
    type: Number  // 1 - unverified, 2 - verified, 3 - ml-admin, 4 - ml-content-manager 
  },
  name: {
    type:String,
    required: true,
    trim: true,
    minlength:1
  },
  profilePicture:{
    type: String
  },
  googlePhoto : {
    type : String
  },
  description:{
    type: String,
    trim:true
  },
  college:{
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});


var User = mongoose.model('User', UserSchema);


module.exports = {User}
