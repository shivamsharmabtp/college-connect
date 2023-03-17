var express = require("express");
var router = express.Router();
module.exports = router;

const fileName = __filename;

/* Homepage */
router.get("/", (req, res) => {
  try {
    res.render("main");
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
