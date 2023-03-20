const mongoose = require("mongoose");

var CourseSchema = new mongoose.Schema({
  creator: {
    type: String,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  shortName: {
    type: String,
    trim: true,
  },
  department: String,
  university: {
    type: String,
  },
  paths: [
    {
      university: String,
      department: String,
      type: String,
      pathId: String,
    },
  ],
  createdOn: {
    type: Number,
  },
});

var Course = mongoose.model("Course", CourseSchema);

module.exports = { Course };
