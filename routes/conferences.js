const express = require("express");
const router = express.Router();
const fs = require("fs");
const fse = require("fs-extra");

// get Conference module
var Conference = require("../models/conference");

// Get all Conferences
router.get("/", async function (req, res) {
  const query = {};
  const sort = { _id: -1 };

  var count;
  const conferences = await Conference.find(query).sort(sort).limit(1);

  count = await Conference.find().countDocuments(function (err, c) {
    count = c;
  });

  const totalPages = Math.ceil(count / 1);
  const page = 1;

  res.render("all_conferences", {
    title: "All Conferences",
    conferences: conferences,
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
    res.redirect("/conferences");
  }

  var count;

  const conferences = await Conference.find()
    .sort({ _id: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  count = await Conference.find().countDocuments(function (err, c) {
    count = c;
  });

  res.render("all_conferences", {
    title: "All Conferences",
    conferences: conferences,
    page: page,
    totalPages: totalPages,
    count: count,
  });
});

// router.get("/get-conferences/:start/:limit", async function (req, res) {
//   const { start, limit } = req.params;

//   const conferences = await Conference.find()
//     .sort({ _id: -1 })
//     .skip(parseInt(start))
//     .limit(parseInt(limit));

//   res.send(conferences);
// });

// Get single conferences details
router.get("/:conference", function (req, res) {
  var galleryImages = null;

  Conference.findOne(
    { slug: req.params.conference },
    function (err, conference) {
      if (err) {
        console.log(err);
      } else {
        var galleryDir =
          "public/conference_images/" + conference._id + "/gallery";

        fs.readdir(galleryDir, function (err, files) {
          if (err) {
            console.log(err);
          } else {
            galleryImages = files;

            res.render("conference", {
              title: conference.title,
              p: conference,
              galleryImages: galleryImages,
            });
          }
        });
      }
    }
  );
});

// Exports
module.exports = router;
