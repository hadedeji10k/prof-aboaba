const mongoose = require("mongoose");

// Research Schema
const ResearchSchema = mongoose.Schema({
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

var Research = (module.exports = mongoose.model("Research", ResearchSchema));
