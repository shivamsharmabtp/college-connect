var express = require("express");

var { authenticate } = require("../middleware/authenticate");
var { View } = require("./../models/viewModel");

var router = express.Router();
module.exports = router;

router.post("/", authenticate, (req, res) => {
  try {
    obj = {
      time: new Date().getTime(),
      pageId: req.body.pageId,
      pageType: req.body.pageType,
      university: req.body.university,
      user: req.user ? req.user.id : null,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
    };
    var view = new View(obj);
    view.save((err) => {
      if (err) {
        console.log(err);
      }
    });

    res.send("success");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});
