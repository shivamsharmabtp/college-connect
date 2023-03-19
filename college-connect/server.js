const express = require("express"); //
const bodyParser = require("body-parser");
const path = require("path");
const createError = require("http-errors");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const fs = require("fs");

var mainRoutes = require("./routes/mainApi");
var userRoutes = require("./routes/userApi");
var universitiesRoutes = require("./routes/universitiesApi");
var universityRoutes = require("./routes/universityApi");
var uploadRoutes = require("./routes/upload");
var adminRoutes = require("./routes/adminApi");

var { mongoose } = require("./db/mongoose");

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

// All api calls will be handled here
app.use("/user", userRoutes);
app.use("/universities", universitiesRoutes);
app.use("/university", universityRoutes)
app.use("/upload", uploadRoutes);
app.use("/upload", uploadRoutes);
app.use("/admin", adminRoutes);
app.use("/", mainRoutes);


// All api calls which could not be matched go here
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  console.log("Error occured in matching route.");
  console.log(err);
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
