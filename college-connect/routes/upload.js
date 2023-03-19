var express = require("express");
var router = express.Router();
var formidable = require("formidable");
var path = require("path");
var toPdf = require("office-to-pdf");
var fs = require("fs");
var uniqid = require("uniqid");
const readChunk = require("read-chunk");
const fileType = require("file-type");



const fileName = __filename;

module.exports = router;

router.post("/", async function (req, res) {
  try {
    var form = new formidable.IncomingForm();
    var filetype = req.header("filetype");
    form.multiples = true;
    var newName = "";
    var file1;
    form.uploadDir = path.join(__dirname, "../public/uploads");
    form.on("file", function (name, file) {
      file1 = file;
    });

    form.on("error", function (err) {
      console.log("An error has occured: \n" + err);
    });

    form.on("end", async function () {
      newName =
        uniqid() +
        "-" +
        file1.name.toLowerCase().split(" ").join("-").split("#").join("");

      fs.rename(file1.path, path.join(form.uploadDir, newName), () => {
        var buffer = readChunk.sync(
          form.uploadDir + "/" + newName,
          0,
          fileType.minimumBytes
        );
        var mime = fileType(buffer).mime;
        if (!mime.includes("pdf") && filetype.includes("pdf")) {
          officeBuffer = fs.readFileSync(form.uploadDir + "/" + newName);
          toPdf(officeBuffer).then(
            (pdfBuffer) => {
              oldNewName = newName;
              newName += ".pdf";
              mime = fileType(pdfBuffer).mime;
              fs.writeFileSync(form.uploadDir + "/" + newName, pdfBuffer);
              if (mime.includes(filetype)) {
                var fileUrl = "/uploads/" + newName;
                res.status(200).json({ url: fileUrl });
              } else {
                res.status(400).send("wrongFileType");
              }
              return;
            },
            (err) => {
              console.log(err);

              res.status(500).send("Error converting file to pdf.");
              fs.unlink(
                path.join(__dirname, "../public/uploads/") + oldNewName,
                (err) => {
                  if (err) {
                    console.log(err);

                  }
                }
              );
              return;
            }
          );
        } else {
          if (mime.includes(filetype)) {
            var fileUrl = "/uploads/" + newName;
            res.status(200).json({ url: fileUrl });
          } else {
            res.status(400).send("wrongFileType");
          }
        }
      });
    });
    form.parse(req);
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

router.post("/image", function (req, res) {
  try {
    var form = new formidable.IncomingForm();
    var filetype = "image";
    form.multiples = true;
    var newName = "";
    var file1;
    form.uploadDir = path.join(__dirname, "../public/uploads");
    form.on("file", function (name, file) {
      file1 = file;
    });

    form.on("error", function (err) {
      console.log("An error has occured: \n" + err);
    });

    form.on("end", function () {
      newName =
        uniqid() +
        "-" +
        file1.name.toLowerCase().split(" ").join("-").split("#").join("");
      var fileUrl = "/uploads/" + newName;
      fs.rename(file1.path, path.join(form.uploadDir, newName), () => {
        var buffer = readChunk.sync(
          form.uploadDir + "/" + newName,
          0,
          fileType.minimumBytes
        );
        var mime = fileType(buffer).mime;
        if (mime.includes(filetype)) {
          res.status(200).send("Success");
        } else {
          res.status(400).send("wrongFileType");
        }
      });
    });
    form.parse(req);
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
