const express = require("express");
const router = express.Router();
const fs = require("fs");
const fse = require("fs-extra");

// get book module
var Book = require("../models/book");

// Get all book
router.get("/", async function (req, res) {
  const query = {};
  const sort = { _id: -1 };
  var count;

  const books = await Book.find(query).sort(sort).limit(1);

  count = await Book.find().countDocuments(function (err, c) {
    count = c;
  });

  const totalPages = Math.ceil(count / 1);
  const page = 1;

  res.render("all_books", {
    title: "All Books",
    books: books,
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
    res.redirect("/books");
  }

  var count;

  const books = await Book.find()
    .sort({ _id: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  count = await Book.find().countDocuments(function (err, c) {
    count = c;
  });

  res.render("all_books", {
    title: "All Books",
    books: books,
    page: page,
    totalPages: totalPages,
    count: count,
  });
});

// router.get("/get-books/:start/:limit", async function (req, res) {
//   const { start, limit } = req.params;

//   const books = await Book.find()
//     .sort({ _id: -1 })
//     .skip(parseInt(start))
//     .limit(parseInt(limit));

//   res.send(books);
// });

// Get single book details
router.get("/:book", function (req, res) {
  var galleryImages = null;

  Book.findOne({ slug: req.params.book }, function (err, book) {
    if (err) {
      console.log(err);
    } else {
      var galleryDir = "public/book_images/" + book._id + "/gallery";

      fs.readdir(galleryDir, function (err, files) {
        if (err) {
          console.log(err);
        } else {
          galleryImages = files;

          res.render("book", {
            title: book.title,
            p: book,
            // bookFile: book.file;
            galleryImages: galleryImages,
          });
        }
      });
    }
  });
});

// Exports
module.exports = router;
