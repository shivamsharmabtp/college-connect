var express = require("express");
var router = express.Router();
module.exports = router;

const fileName = __filename;

router.get('/search', (req, res) => {
  try{
  var li = req.cookies.li
  res.render('search', {
      li : li
  });
} catch (error) {
  console.log(error);
  res.status(500).send('Error proccesing request.');
}
})

router.get('/about', (req, res) => {
  try {
  var li = req.cookies.li
  res.render('about', {
      li : li
  });
} catch (error) {
  console.log(error);
  res.status(500).send('Error proccesing request.');
}
});

router.get('/privacy', (req, res) => {
  try {
    var li = req.cookies.li
    res.render('privacy', {
        li : li
    })
  } catch (error) {
    console.log(error);
    res.status(500).send('Error proccesing request.');
  }
})

/* Homepage */
router.get("/", (req, res) => {
  try {
    res.render("main");
  } catch (error) {
    console.log(error);
    res.status(500).send("Error proccesing request.");
  }
});
