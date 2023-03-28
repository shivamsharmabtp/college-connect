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


router.post("/search", (req, res) => {
  try {
    body = JSON.parse(req.body.data);
    File.find(
      { $text: { $search: body.query } },
      { score: { $meta: "textScore" } }
    )
      .skip(0)
      .limit(20)
      .sort({ score: { $meta: "textScore" } })
      .exec(async function (err, doc) {
        var files = [];
        for (var i = 0; i < doc.length; i++) {
          if (doc[i].name == body.query && body.source == "read-main") continue;
          file = {
            name: doc[i].name,
            fileId: doc[i].uniqueId,
            views: await View.countDocuments({
              pageType: "read-main",
              pageId: doc[i].uniqueId,
            }),
            time: doc[i].uploadTime,
            author: doc[i].author,
            authorName: await username(doc[i].author),
            pathData: await Course.findOne({ _id: doc[i].courseIds[0] }).exec(),
            semester: doc[i].semester,
            department: doc[i].department,
            university: doc[i].university,
            description: doc[i].description,
          };
          files.push(file);
        }
        let moreDoc = await File.find(
          { name: new RegExp(body.query, "i") },
          null,
          { limit: 15 - doc.length }
        ).exec();
        doc = moreDoc;
        for (i = 0; i < moreDoc.length; i++) {
          if (moreDoc[i].name == body.query && body.source == "read-main")
            continue;
          file = {
            name: doc[i].name,
            fileId: doc[i].uniqueId,
            views: await View.countDocuments({
              pageType: "read-main",
              pageId: doc[i].uniqueId,
            }),
            time: doc[i].uploadTime,
            author: doc[i].author,
            authorName: await username(doc[i].author),
            pathData: await Course.findOne({ _id: doc[i].courseIds[0] }).exec(),
            semester: doc[i].semester,
            department: doc[i].department,
            university: doc[i].university,
            description: doc[i].description,
          };
          if (!files.find((f) => f.fileId == file.fileId)) files.push(file);
        }

        if (files.length == 0 && false) {
          notifySlack("No result found for " + body.query, "search-alerts");
        }
        res.json(files);
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
