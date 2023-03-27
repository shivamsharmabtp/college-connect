var express = require("express");

var { authenticate } = require("./../middleware/authenticate");
var { Course } = require("./../models/courseModel");
var deps = require("./../public/js/deps");
const notifySlack = require("./../lib/slackNotifier");

var router = express.Router();
module.exports = router;

router.post("/addcourse", authenticate, async (req, res) => {
  try {
    if (req.user == null) res.status(401).send("Please sign in to add course.");
    else {
      var body = JSON.parse(req.body.data);
      body.creator = req.user.id;
      body.createdOn = new Date().getTime();
      body.shortName = body.name
        .toLowerCase()
        .split("-")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/[^a-z0-9\ ]/gi, "")
        .split(" ")
        .join("-");
      path = {
        university: body.university,
        department: body.department,
        semester: body.semester,
        pathId: body.university + "&" + body.semester + "&" + body.department,
      };

      Course.findOne(
        {
          $or: [
            { university: body.university, shortName: body.shortName },
            { university: body.university, name: body.name },
          ],
        },
        (err, doc) => {
          if (err) {
            console.log(err);
          } else {
            if (doc == null) {
              body.paths = path.pathId;
              var course = new Course(body);
              course
                .save()
                .then(() => {
                  notifySlack(`New Course Added : ${body.name} in ${body.university}.`, "course-alerts")
                  res.status(200).send("Course created and saved!");
                })
                .catch((e) => {
                  res.status(400).send(e);
                });
            } else {
              if (!doc.paths.includes(path)) {
                Course.findOneAndUpdate(
                  { shortName: body.shortName, university: body.university },
                  { $push: { paths: path } },
                  (error, result) => {
                    if (error) console.log(error);
                    else {
                      res.status(200).send("Course saved!");
                    }
                  }
                );
              } else {
                res.status(200).send("Course already saved here!");
              }
            }
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.post("/list", (req, res) => {
  try {
    var body = JSON.parse(req.body.data);
    var pathId = body.university + "&" + body.semester + "&" + body.department;

    Course.find(
      { paths:  pathId  },
      (err, result) => {
        if (err || result == null) res.status(400).send("Courses not found!");
        res.status(200).send(result);
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

function getImageUrl(dep) {
  for (let i = 0; i < deps.length; i++) {
    if (deps[i].shortName == dep) {
      if (deps[i].pos < 10) pos = "0" + deps[i].pos;
      else pos = deps[i].pos;
      return (
        "/images/icons/deps/" +
        pos +
        "-" +
        dep +
        ".png"
      );
    }
  }
  return null;
}
