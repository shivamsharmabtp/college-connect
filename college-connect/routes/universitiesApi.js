var express = require("express");
const _ = require("lodash");

var { authenticate } = require("../middleware/authenticate");
var { University } = require("../models/universityModel");


const fileName = __filename;

var router = express.Router();
module.exports = router;

router.get("/", async (req, res) => {
  try {
    let universities = await University.find().exec();
    let universityData = [];
    for (let i = 0; i < universities.length; i++) {
      universityData.push({
        name: universities[i].name,
        shortName: universities[i].shortName,
      });
    }
    res.render("universities", {
      li: req.cookies.li,
      universityData: universityData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
    
  }
});
