var express = require("express");
const _ = require("lodash");
var uniqid = require("uniqid");
var request = require("request");
var ObjectId = require("mongodb").ObjectID;

var { authenticate } = require("./../middleware/authenticate");
var { File } = require("./../models/fileModel");
var { University } = require("./../models/universityModel");
var { User } = require("./../models/userModel");
var { View } = require("./../models/viewModel");
var { Course } = require("./../models/courseModel");

var notifySlack = require("../lib/slackNotifier");

const fileName = __filename;

var router = express.Router();
module.exports = router;


router.post("/addfile", authenticate, (req, res) => {
  try {
    if (req.user == null) res.status(401).send("authentication failed");
    else {
      var body = JSON.parse(req.body.data);

      var fileObj = {
        name: body.name,
        url: body.url,
        fileSize: body.fileSize,
        description: body.description,
        category: body.category,
        uploadTime: new Date().getTime(),
        author: req.user.id,
        university: body.university,
        courses: [body.courseName],
        courseIds: [body.courseId],
        type: body.type,
        uniqueId: uniqid(),
      };

      var file = new File(fileObj);

      file.save((err, file) => {
        if (err) {
          res.status(400).send(err);
        } else {
          res.status(200).send("success");
        }
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.post("/filelist", (req, res) => {
  try {
    body = JSON.parse(req.body.data);
    File.find({ courseIds: body.courseId }, async function (err, doc) {
      if (err || doc == null) res.status(400).send(err);
      fileList = [];
      for (i = 0; i < doc.length; i++) {
        file = {
          name: doc[i].name,
          id: doc[i].uniqueId,
          fileType: doc[i].type,
          views: parseInt(
            (
              await View.find({
                pageType: "read-main",
                pageId: doc[i].uniqueId
              }).exec()
            ).length
          ),
          uploadTime: doc[i].uploadTime,
          author: doc[i].author,
          authorName: await username(doc[i].author),
          category: doc[i].category,
        };
        fileList.push(file);
      }
      res.json(fileList);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});


function username(id) {
  return new Promise((resolve, reject) => {
    User.findById(ObjectId(id), function (err, user) {
      if (err || user == null) {
        resolve(null);
      } else resolve(user.name);
    });
  });
}
