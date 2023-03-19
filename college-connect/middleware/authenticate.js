var {User} = require('./../models/userModel');
const adminList = require('../json/adminList.json');

var authenticate = (req, res, next) => {
  var token = req.cookies['x-auth'];

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject();
    }
    req.user = user;
    if(req.user){
      req.userIsLoggedIn = true;
      if(adminList.includes(user.email))
        req.userIsAdmin = true;
    }
    req.token = token;
    next();
  }).catch((e) => {
    res.user = null;
    req.token = null;
    next();
  });
};

module.exports = {authenticate};
