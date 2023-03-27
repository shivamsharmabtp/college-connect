const mongoose = require("mongoose");

var FileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 1,
  },
  url: {
    type: String,
    require: true,
    minlength: 1,
  },
  category: {
    type: Number,
  },
  fileSize: {
    type: String,
  },
  uploadTime: {
    type: Number,
  },
  author: {
    type: String,
  },
  university: {
    type: String,
  },
  courses: [String],
  courseIds: [String],
  type: {
    type: String,
  },
  uniqueId: {
    type: String,
    unique: true,
  },
  description: {
    type: String,
  },
  fileSize: {
    type: Number,
  },
});

FileSchema.index(
  {
    name: "text",
    tags: "text",
    description: "text",
    course: "text",
    department: "text",
  },
  {
    weights: { name: 10, description: 8, tags: 9, course: 6, department: 4 },
  }
);

FileSchema.on("index", function (err) {
  if (err) {
    console.error("File index error: %s", err);
  } else {
    console.info("File indexing complete");
  }
});

var File = mongoose.model("File", FileSchema);

module.exports = { File };
