const express = require("express");
const router = express.Router();
const fs = require("fs");
const fse = require("fs-extra");

// get resources module
var Resources = require("../models/resources");

// Get all resources
router.get("/", async function (req, res) {
  const query = {};
  const sort = { _id: -1 };

  var count;

  const resources = await Resources.find(query).sort(sort).limit(1);

  count = await Resources.find().countDocuments(function (err, c) {
    count = c;
  });

  const totalPages = Math.ceil(count / 1);
  const page = 1;

  res.render("all_resources", {
    title: "All Resources",
    resources: resources,
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
    res.redirect("/resources");
  }

  var count;

  const resources = await Resources.find()
    .sort({ _id: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  count = await Resources.find().countDocuments(function (err, c) {
    count = c;
  });

  res.render("all_resources", {
    title: "All Resources",
    resources: resources,
    page: page,
    totalPages: totalPages,
    count: count,
  });
});

// router.get("/get-resources/:start/:limit", async function (req, res) {
//   const { start, limit } = req.params;

//   const resources = await Resources.find()
//     .sort({ _id: -1 })
//     .skip(parseInt(start))
//     .limit(parseInt(limit));

//   res.send(resources);
// });

// Get single resources details
router.get("/:resources", function (req, res) {
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
