var express = require("express");
var ObjectId = require("mongodb").ObjectID;

var { File } = require("./../models/fileModel");
var { User } = require("./../models/userModel");
var { View } = require("./../models/viewModel");
var { Course } = require("./../models/courseModel");

var router = express.Router();
module.exports = router;

router.get("/", (req, res) => {
  try {
    File.findOne({ uniqueId: req.query.v }, async function (err, result) {
      try {
        if (err) {
          res.render("error");
        }
        if (result) {
          res.render("read", {
            li: req.cookies.li,
            url: result.url,
            type: result.type,
            imgUrl: getDocThumbnail(result.type),
            path: result.path,
            title: result.name,
            views: parseInt(
              (
                await View.find({
                  pageType: "read-main",
                  pageId: result.uniqueId
                }).exec()
              ).length
            ),
            authorId: result.author,
            authorName: await username(result.author),
            description: result.description,
            authorImage: await userimage(result.author),
            universityId: result.university,
            pageId: req.query.v,
            courseName: (
              await Course.findOne({ _id: result.courseIds[0] }).exec()
            ).name,
          });
        } else {
          res.status(404).render("error");
        }
      } catch (err) {
        console.log(err);
        res.render("error");
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

function username(id) {
  return new Promise((resolve, reject) => {
    User.findById(ObjectId(id), function (err, user) {
      if (err) {
        reject();
        return null;
      }
      if (user) resolve(user.name);
      else resolve(null);
    });
  });
}

function userimage(id) {
  return new Promise((resolve, reject) => {
    User.findById(ObjectId(id), function (err, user) {
      if (err) {
        reject();
        return null;
      }
      if (user) resolve(user.profilePicture);
      else reject(null);
    });
  });
}

function getDocThumbnail(type) {
  if (type == "file")
    return "/images/icons/main/24-pdf.png";
  if (type == "link")
    return "/images/icons/main/23-link.png";
  if (type == "video")
    return "/images/icons/main/25-video.png";
}
