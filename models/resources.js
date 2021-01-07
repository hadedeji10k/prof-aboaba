const mongoose = require("mongoose");

// Resources Schema
const ResourcesSchema = mongoose.Schema({
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
  link: {
    type: String,
    required: true
  }
});

var Resources = (module.exports = mongoose.model("Resources", ResourcesSchema));
