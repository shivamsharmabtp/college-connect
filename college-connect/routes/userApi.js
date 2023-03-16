const express = require('express');
const _ = require('lodash');
const uniqid = require('uniqid');
const nodemailer = require('nodemailer');
const generatePassword = require('password-generator');
const md5 = require('md5');
const cookieParser = require('cookie-parser');
const {OAuth2Client} = require('google-auth-library');
var ObjectId = require('mongodb').ObjectID;
var router = express.Router();
module.exports = router;

var g_token = "312975383578-aoia4cu34demtrstbhdkhg6shhjbiedc.apps.googleusercontent.com";

// GET signin page
router.get('/signin', (req, res) => {
  res.render('signin',{
    g_token : g_token
  });
});
