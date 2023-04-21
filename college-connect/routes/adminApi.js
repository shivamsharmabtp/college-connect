var express = require("express");
const _ = require("lodash");

const adminList = require("./../json/adminList.json");

var { authenticate } = require("./../middleware/authenticate");
var Collections = {
  University: require("./../models/universityModel").University,
  User: require("./../models/userModel").User,
  Course: require("./../models/courseModel").Course,
  File: require("./../models/fileModel").File,
};

var notifySlack = require("../lib/slackNotifier");

var router = express.Router();
module.exports = router;

router.get("/", authenticate, (req, res) => {
  try {
    if (req.user && adminList.includes(req.user.email)) {
      res.render("adminDashboard", {
        title: "Admin",
      });
    } else {
      console.log("Access denied");
      res.render("error");
    }
  } catch (error) {
    console.log(error);
    res.send("error");
  }
});

router.post("/get/:collection", authenticate, async (req, res) => {
  try {
    if (req.user != null && adminList.includes(req.user.email)) {
      Collections[req.params.collection].find((err, docs) => {
        if (err) throw new Error(err);
        else {
          var parser = collectionDataParser[req.params.collection];
          var jsonData = parser(docs);
          res.json(jsonData);
        }
      });
    } else {
      res.status(401).send("Unauthourized Request");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
    
  }
});

router.post("/edit/:collection", authenticate, async (req, res) => {
  try {
    if (req.user != null && adminList.includes(req.user.email)) {
      var body = req.body;
      Collections[req.params.collection].findByIdAndUpdate(
        body._id,
        { $set: body },
        (err, docs) => {
          if (err) res.status(500).send("error processing request");
          else res.status(200).send("Updated succesfully");
        }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error processing request");
    
  }
});

router.post("/delete/:collection", authenticate, async (req, res) => {
  try {
    if (req.user != null && adminList.includes(req.user.email)) {
      var body = req.body;
      Collections[req.params.collection].findByIdAndDelete(
        body._id,
        (err, docs) => {
          if (err) res.status(500).send("error processing request");
          else res.status(200).send("Updated succesfully");
        }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error processing request");
    
  }
});

var collectionDataParser = {
  User: (data) => {
    var jsonData = [];
    data.forEach((user) => {
      jsonData.push({
        _id: user._id,
        email: user.email,
        name: user.name,
        profilePicture: user.profilePicture,
        googlePhoto: user.googlePhoto,
      });
    });
    return jsonData;
  },

  University: (data) => {
    var jsonData = [];
    data.forEach((university) => {
      jsonData.push({
        _id: university._id,
        creator: university.creator,
        name: university.name,
        shortName: university.shortName,
        status: university.status,
        address: university.address,
        description: university.description,
        departments: university.departments,
        picture: university.picture,
        createdOn: university.createdOn,
      });
    });
    return jsonData;
  },

  Course: (data) => {
    var jsonData = [];
    data.forEach((course) => {
      jsonData.push({
        _id: course._id,
        creator: course.creator,
        name: course.name,
        shortName: course.shortName,
        department: course.department,
        university: course.university,
        paths: course.paths,
        createdOn: course.createdOn,
      });
    });
    return jsonData;
  },

  File: (data) => {
    var jsonData = [];
    data.forEach((file) => {
      jsonData.push({
        _id: file._id,
        name: file.name,
        url: file.url,
        category: file.category,
        author: file.author,
        university: file.university,
        courses: file.courses,
        courseIds: file.courseIds,
        type: file.type,
        uniqueId: file.uniqueId,
        description: file.description,
      });
    });
    return jsonData;
  },

  Visit: (data) => {
    return data;
  },
};
