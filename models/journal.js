const mongoose = require("mongoose");

// journal Schema
const JournalSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
  },
  desc: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  file: {
    type: String,
  },
  date: {
    type: String,
  },
});

var Journal = (module.exports = mongoose.model("Journal", JournalSchema));
