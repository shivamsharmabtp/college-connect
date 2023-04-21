const express = require("express");
const { OAuth2Client } = require("google-auth-library");
var ObjectId = require("mongodb").ObjectID;


var router = express.Router();
module.exports = router;

var { authenticate } = require("./../middleware/authenticate");
var { File } = require("./../models/fileModel");
var { User } = require("./../models/userModel");
var { View } = require("./../models/viewModel");
var { Course } = require("./../models/courseModel");

const fileName = __filename;
const client = new OAuth2Client(
  "66303115487-0l4aecii49r6at5icr799bqghd36k6bv.apps.googleusercontent.com"
);
var g_token =
  "312975383578-aoia4cu34demtrstbhdkhg6shhjbiedc.apps.googleusercontent.com";

// GET signin page
router.get("/signin", (req, res) => {
  res.render("signin", {
    g_token: g_token,
  });
});

router.post("/google/signin", (req, res) => {
  try {
    date = new Date();
    async function verify() {
      const ticket = await client.verifyIdToken({
        idToken: req.body.idToken,
        audience: g_token,
      });
      const payload = ticket.getPayload();
      if (payload.email_verified) {
        var body = {
          email: payload.email,
          name: payload.name,
          password: payload.sub,
          profilePicture: payload.picture,
          googlePhoto: payload.picture,
          timeLag: date.getTime() - req.body.time,
          joinDate: date.getTime(),
        };
        var user = new User(body);
        user
          .save()
          .then(() => {
            res.status(200);
            user.generateAuthToken().then((token) => {
              res.cookie("li", 1, { maxAge: 3075840000, path: "/" });
              res.cookie("x-auth", token, { maxAge: 3075840000, path: "/" });
              res.json({ msg: "success" });
              // TODO : Implement Slack and Email notification logic
            });
          })
          .catch((e) => {
            User.findByCredentials(body.email, body.password)
              .then((user) => {
                user
                  .generateAuthToken()
                  .then((token) => {
                    res.cookie("li", 1, { maxAge: 30758400000, path: "/" });
                    res.cookie("x-auth", token, {
                      maxAge: 3075840000,
                      path: "/",
                    });
                    res.json({ msg: "success" });
                  })
                  .catch((e) => {
                    console.log("error generating auth token");
                  });
              })
              .catch((error) => {
                console.log("login failed " + error);
                res.status(400).send(error);
              });
          });
      } else {
        throw new Error("token verification failed");
      }
    }
    verify().catch((e) => {
      console.log("token verification failed");
      res.status(400).send("error");
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
    var err = error;
    if (err) {
      var apiName = req.method + " " + req.originalUrl;
      if (typeof err == "object") {
        var errMsg =
          "*File : " +
          fileName +
          "*\n*API : " +
          apiName +
          "*\nError - ```" +
          JSON.stringify(err, Object.getOwnPropertyNames(err), 2) +
          "```";
      } else {
        var errMsg =
          "*File : " +
          fileName +
          "*\n*API : " +
          apiName +
          "*\nError - ```" +
          err +
          "```";
      }
      console.log(errMsg);
    }
  }
});

router.post("/userinfo", authenticate, (req, res) => {
  try {
    if (req.user == null) res.status("401").send("unauthorized");
    else {
      User.findOne(
        { _id: req.user.id },
        { email: 1, name: 1, profilePicture: 1 },
        { lean: true },
        (err, doc) => {
          if (err || doc == null) res.status(400).send(err);
          else res.json(doc);
        }
      );
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});


router.post("/logout", authenticate, (req, res) => {
  try {
    if (req.user == null) res.status(400).send();
    else {
      req.user.removeToken(req.token).then(
        () => {
          res.status(200).send();
        },
        () => {
          res.status(400).send();
        }
      );
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
      notifySlack(slackText, "prod-alerts");
    }
  }
});

router.post("/updateBasic", authenticate, async (req, res) => {
  try {
    body = JSON.parse(req.body.data);
    if (req.user) {
      User.findByIdAndUpdate(req.user.id, body, (err, docs) => {
        if (err) res.status(500).send("error processing request");
        else res.status(200).send("Updated succesfully");
      });
    } else {
      res.status(401).send("Authourisation failed!");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
    
  }
});

router.post("/updateProfilePicture", authenticate, async (req, res) => {
  try {
    body = JSON.parse(req.body.data);
    if (req.user) {
      User.findByIdAndUpdate(req.user.id, body, (err, docs) => {
        if (err) res.status(500).send("error processing request");
        else res.status(200).send(body.profilePicture);
      });
    } else {
      res.status(401).send("Authourisation failed!");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.post("/getBasic", authenticate, async (req, res) => {
  try {
    body = JSON.parse(req.body.data);
    res.json({
      userId: req.user ? req.user.id : "",
      description: await userDetail(body.id, "description"),
      university: await userDetail(body.id, "university"),
      department: await userDetail(body.id, "department"),
      profilePicture: await userDetail(body.id, "profilePicture"),
      googlePhoto: await userDetail(body.id, "googlePhoto"),
      email: await userDetail(body.id, "email"),
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

router.post("/getDocs", (req, res) => {
  try {
    body = JSON.parse(req.body.data);
    let hourAgoTime = new Date().getTime() - 60 * 60 * 1000;
    File.find({ author: body.id })
      .skip(body.skip)
      .exec(async function (err, doc) {
        if (err) {
          console.log(err);
          res.json([]);
        } else {
          var files = [];
          for (var i = 0; i < doc.length; i++) {
            file = {
              name: doc[i].name,
              fileId: doc[i].uniqueId,
              views: parseInt(
                (
                  await View.find({
                    pageType: "read-main",
                    pageId: doc[i].uniqueId,
                    time: { $lt: hourAgoTime },
                  }).exec()
                ).length
              ),
              time: doc[i].uploadTime,
              author: doc[i].author,
              authorName: await userDetail(doc[i].author, "name"),
              pathData: await Course.findOne({
                _id: doc[i].courseIds[0],
              }).exec(),
              semester: doc[i].semester,
              department: doc[i].department,
              university: doc[i].university,
              description: doc[i].description,
            };
            files.push(file);
          }
          res.json(files);
        }
      });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});


router.get("/:userId", authenticate, async (req, res) => {
  try {
    var li = req.cookies.li;
    if (req.user) userId = req.user.id;
    else userId = null;
    try {
      res.render("profile", {
        li: li,
        userId: userId,
        picture: await userDetail(req.params.userId, "profilePicture"),
        views: await userDetail(req.params.userId, "views"),
        name: await userDetail(req.params.userId, "name"),
        files: await userDetail(req.params.userId, "files"),
      });
    } catch (err) {
      console.log(err);
      res.render("error");
    }
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});

async function userDetail(id, detail) {
  if (detail == "views") {
    return new Promise((resolve, reject) => {
      File.find({ author: id }, async (err, doc) => {
        if (err || doc == null) resolve(0);
        count = 0;
        for (i = 0; i < doc.length; i++) {
          count += await View.countDocuments({
            pageType: "read-main",
            pageId: doc[i].uniqueId,
          });
        }
        resolve(count);
      });
    });
  }

  if (detail == "files") {
    return new Promise((resolve, reject) => {
      File.find({ author: id }, (err, doc) => {
        if (err || doc == null) resolve(0);
        resolve(doc.length);
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      User.findById(ObjectId(id), function (err, user) {
        if (err) {
          reject();
          return null;
        }
        if (user) resolve(user[detail]);
        else reject();
      });
    });
  }
}
