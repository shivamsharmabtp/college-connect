var express = require("express");
const _ = require("lodash");

const fileName = __filename;

const adminList = require("../json/adminList.json");
var { authenticate } = require("../middleware/authenticate");
var { University } = require("../models/universityModel");


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
    var err = error;
    if (err) {
      var apiName = req.method + " " + req.originalUrl;
      if (typeof err == "object") {
        var slackText =
          "*File : " +
          fileName +
          "*\n*API : " +
          apiName +
          "*\nError - ```" +
          JSON.stringify(err, Object.getOwnPropertyNames(err), 2) +
          "```";
      } else {
        var slackText =
          "*File : " +
          fileName +
          "*\n*API : " +
          apiName +
          "*\nError - ```" +
          err +
          "```";
      }
    }
  }
});

router.post("/adduniversity", authenticate, async (req, res) => {
  try {
    if (req.user == null) res.status(401).send("authentication failed");
    else {
      var body = JSON.parse(req.body.data);
      body.creator = req.user.id;
      body.createdOn = new Date().getTime();
      body.departments = body.departments
        ? body.departments
        : [
            "electrical",
            "geology",
            "aerospace",
            "ocean-engineering",
            "industrial",
            "mining",
            "law",
            "manufacturing",
            "architecture",
            "chemical",
            "chemistry",
            "civil-engineering",
            "computer-science",
            "ece",
            "mathematics",
            "humanities",
            "bio-technology",
            "agriculture",
            "mechanical",
            "physics",
            "entrepreneurship",
            "finance",
            "rubber",
            "placement",
            "firstyear",
          ];
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
        })
        .catch((e) => {
         
      
          res.status(400).send(e);
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
    var err = error;
    if (err) {
      var apiName = req.method + " " + req.originalUrl;
      if (typeof err == "object") {
        var slackText =
          "*File : " +
          fileName +
          "*\n*API : " +
          apiName +
          "*\nError - ```" +
          JSON.stringify(err, Object.getOwnPropertyNames(err), 2) +
          "```";
      } else {
        var slackText =
          "*File : " +
          fileName +
          "*\n*API : " +
          apiName +
          "*\nError - ```" +
          err +
          "```";
      }
     
    }
  }
});




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
    var err = error;
    if (err) {
      var apiName = req.method + " " + req.originalUrl;
      if (typeof err == "object") {
        var slackText =
          "*File : " +
          fileName +
          "*\n*API : " +
          apiName +
          "*\nError - ```" +
          JSON.stringify(err, Object.getOwnPropertyNames(err), 2) +
          "```";
      } else {
        var slackText =
          "*File : " +
          fileName +
          "*\n*API : " +
          apiName +
          "*\nError - ```" +
          err +
          "```";
      }
    
    }
  }
});

