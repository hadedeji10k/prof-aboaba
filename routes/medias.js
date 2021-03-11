const express = require("express");
const router = express.Router();
const fs = require("fs");
const fse = require("fs-extra");

// get book module
var Media = require("../models/media");

// // Get category module
// var Category = require("../models/category")

// Get all medias
router.get("/", async function (req, res) {
  const query = {};
  const sort = { _id: -1 };
  var count;

  const medias = await Media.find(query).sort(sort).limit(1);

  count = await Media.find().countDocuments(function (err, c) {
    count = c;
  });

  const totalPages = Math.ceil(count / 1);
  const page = 1;

  res.render("all_medias", {
    title: "All Medias",
    medias: medias,
    count: count,
    totalPages: totalPages,
    page: page,
  });
});

router.get("/:page/:totalPages", async function (req, res) {
  const { page, totalPages } = req.params;
  const limit = 1;
  const skip = parseInt(parseInt(page) * limit - 1);

  if (page == 1) {
    res.redirect("/medias");
  }

  var count;

  const medias = await Media.find()
    .sort({ _id: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  count = await Media.find().countDocuments(function (err, c) {
    count = c;
  });

  res.render("all_medias", {
    title: "All Medias",
    medias: medias,
    page: page,
    totalPages: totalPages,
    count: count,
  });
});

// router.get("/get-medias/:start/:limit", async function (req, res) {
//   const { start, limit } = req.params;

//   const medias = await Media.find()
//     .sort({ _id: -1 })
//     .skip(parseInt(start))
//     .limit(parseInt(limit));

//   res.send(medias);
// });

// Get single media details
router.get("/:media", function (req, res) {
  Media.findOne({ slug: req.params.media }, function (err, media) {
    if (err) {
      console.log(err);
    } else {
      res.render("media", {
        title: media.title,
        p: media,
        // bookFile: book.file;
      });
    }
  });
});

// Exports
module.exports = router;
