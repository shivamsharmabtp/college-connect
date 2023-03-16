const express = require("express"); //
const bodyParser = require("body-parser");
const path = require("path");
const createError = require("http-errors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const fs = require("fs");

var app = express();
var port = 80;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());

const config = { env: "local" };

if (config.env == "local") {
  app.use((req, res, next) => {
    const date = new Date();
    process.stdout.write(date.toLocaleTimeString() + " ");
    next();
  });
  app.use(logger("dev"));
}

app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  if (req.method == "GET") res.render("error");
  else res.status(500).send("Error proccessing request. Status 500");
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});
