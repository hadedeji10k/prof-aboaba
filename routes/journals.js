const express = require("express");
const router = express.Router();
const fs = require("fs");
const fse = require("fs-extra");

// get journal module
var Journal = require("../models/journal");

// Get all journal
router.get("/", async function (req, res) {
  const query = {};
  const sort = { _id: -1 };

  var count;

  const journals = await Journal.find(query).sort(sort).limit(1);

  count = await Journal.find().countDocuments(function (err, c) {
    count = c;
  });

  const totalPages = Math.ceil(count / 1);
  const page = 1;

  res.render("all_journals", {
    title: "All Journals",
    journals: journals,
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
    res.redirect("/journals");
  }

  var count;

  const journals = await Journal.find()
    .sort({ _id: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  count = await Journal.find().countDocuments(function (err, c) {
    count = c;
  });

  res.render("all_journals", {
    title: "All Journals",
    journals: journals,
    page: page,
    totalPages: totalPages,
    count: count,
  });
});

// router.get("/get-journals/:start/:limit", async function (req, res) {
//   const { start, limit } = req.params;

//   const journals = await Journal.find()
//     .sort({ _id: -1 })
//     .skip(parseInt(start))
//     .limit(parseInt(limit));

//   res.send(journals);
// });

// Get single journal details
router.get("/:journal", function (req, res) {
  var galleryImages = null;

  Journal.findOne({ slug: req.params.journal }, function (err, journal) {
    if (err) {
      console.log(err);
    } else {
      var galleryDir = "public/journal_images/" + journal._id + "/gallery";

      fs.readdir(galleryDir, function (err, files) {
        if (err) {
          console.log(err);
        } else {
          galleryImages = files;

          res.render("journal", {
            title: journal.title,
            p: journal,
            galleryImages: galleryImages,
          });
        }
      });
    }
  });
});

// Exports
module.exports = router;
