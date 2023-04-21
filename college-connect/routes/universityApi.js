var express = require("express");

const adminList = require("../json/adminList.json");
var { authenticate } = require("../middleware/authenticate");
var { University } = require("../models/universityModel");
var { Course } = require("../models/courseModel");
var { File } = require("../models/fileModel");
const notifySlack = require("../lib/slackNotifier");

var router = express.Router();
module.exports = router;

router.get("/adduniversity", authenticate, (req, res) => {
  try {
    if (req.user == null) {
      if (req.cookies.li != 1) {
        res.redirect("/user/signin?continue=/university/adduniversity");
      }
    } else {
      res.render("adduniversity");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.post("/adduniversity", authenticate, async (req, res) => {
  try {
    if (req.user == null) res.status(401).send("authentication failed");
    else {
      var body = JSON.parse(req.body.data);
      body.creator = req.user.id;
      body.createdOn = new Date().getTime();
      body.status = "trial";
      body.shortName = body.name
        .toLowerCase()
        .replace(/[^a-z0-9\ ]/gi, "")
        .split(" ")
        .join("-");
      var university = new University(body);
      university
        .save()
        .then(() => {
          res.status(200).send("sucess");
          notifySlack(`New University Added : *${body.name}*.\n
          
          <http://localhost/university/${body.shortName}/updateStatus/active|✅ *Approve*>      |       <http://localhost/university/${body.shortName}/updateStatus/trial|*❌ Reject*>
          `, "university-alerts");
        })
        .catch((e) => {
          res.status(400).send(e);
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.get("/:university/updateStatus/:status", authenticate, (req, res) => {
  try {
    if (req.user && adminList.includes(req.user.email)){
      University.findOneAndUpdate(
        { shortName: req.params.university },
        { status: req.params.status },
        (err, result) => {
          if (err) {
            console.log(err);
          } else {
            res.status(200).send("sucess");
          }
        }
      );
    }else{
      res.send("Unauthorized");
    }
  } catch (error) {
    res.status(500).send("Error proccesing request.");
    console.log(error);
  }
})

router.post("/universitylist", authenticate, (req, res) => {
  try {
    University.find(async (err, doc) => {
      if (err || doc == null) res.status(500).send(err);
      universityData = [];
      for (i = 0; i < doc.length; i++) {
        var cData = {
          name: doc[i].name,
          shortName: doc[i].shortName,
          address: doc[i].address,
          status: doc[i].status,
          courseCount: await Course.countDocuments({
            university: doc[i].shortName,
          }),
          docCount: await File.countDocuments({ university: doc[i].shortName }),
        };
        if (doc[i].status != "trial") {
          universityData.push(cData);
        } else {
          if (req.user) {
            if (
              adminList.includes(req.user.email) ||
              doc[i].creator == req.user.id
            ) {
              universityData.push(cData);
            }
          }
        }
      }
      res.json(universityData);
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.post("/adddep", authenticate, (req, res) => {
  try {
    if (req.user == null) {
      res.status(401).send("User not found!");
    } else {
      University.findOneAndUpdate(
        { shortName: req.body.university },
        { $push: { departments: req.body.name } },
        (err, result) => {
          if (err) {
            res.status(500).send("Error occured" + err);
          } else {
            res.status(200).send("Success");
          }
        }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.get("/universityDepList/:university", (req, res) => {
  try {
    University.findOne({ shortName: req.params.university }, (err, doc) => {
      if (err || doc == null) {
        console.log(err);
        res.send(null);
        return;
      } else {
        res.json(doc.departments);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.post("/courseList", (req, res) => {
  try {
    Course.find({ university: req.body.university }, (err, docs) => {
      if (err) {
        console.log(err);
      } else {
        var courseNames = [];
        docs.forEach((doc) => {
          courseNames.push(doc.name);
        });
        res.json(courseNames);
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.get("/:university", authenticate, async (req, res) => {
  try {
    var li = req.cookies.li;
    let courses = await Course.find({
      university: req.params.university,
    }).exec();
    let courseData = [];
    for (let i = 0; i < courses.length; i++) {
      courseData.push({
        name: courses[i].name,
        shortName: courses[i].shortName,
        _id: courses[i]._id,
        university: req.params.university,
      });
    }
    University.findOne({ shortName: req.params.university }, (err, doc) => {
      if (err || doc == null) {
        console.log(err);
        res.render("error");
        return;
      } else {
        if (doc.status != "trial" || true) {
          res.render("university", {
            li: li,
            title: doc.name,
            address: doc.address,
            description: doc.description,
            picture: doc.picture,
            imgUrl: doc.picture,
            courseData: courseData,
          });
        } else {
          if (req.user) {
            if (
              adminList.includes(req.user.email) ||
              doc.creator == req.user.id
            ) {
              res.render("university", {
                li: li,
                title: doc.name,
                address: doc.address,
                description: doc.description,
                picture: doc.picture,
                courseData: [],
              });
            } else res.render("error");
          } else res.render("error");
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});
