const mongoose = require("mongoose");

// Conference Schema
const ConferenceSchema = mongoose.Schema({
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

var Conference = (module.exports = mongoose.model("Conference", ConferenceSchema));
