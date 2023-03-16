var mongoose = require("mongoose");

mongoose.Promise = global.Promise;
mongoose.set("useFindAndModify", false);
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/college_connect",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(
    () => {
      console.log("Connected to mongodb!");
    },
    (err) => {
      console.log("Failed to connect to mongodb");
      console.log(err);
    }
  );

module.exports = { mongoose };
