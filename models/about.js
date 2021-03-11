const mongoose = require("mongoose");

// About Schema
const AboutSchema = mongoose.Schema({
  title: {
    type: String,
  },
  slug: {
    type: String,
  },
  desc: {
    type: String,
    required: true,
  },
});

var About = (module.exports = mongoose.model("About", AboutSchema));
