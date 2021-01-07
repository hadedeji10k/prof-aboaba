const mongoose = require("mongoose");

// Carousel Schema
const CarouselSchema = mongoose.Schema({
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
});

var Carousel = (module.exports = mongoose.model("Carousel", CarouselSchema));
