const express = require("express");
const router = express.Router();
const mkdirp = require("mkdirp");
const fse = require("fs-extra");
const resizeImg = require("resize-img");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");
// require authentication for Admin
const auth = require("../config/auth");
const isAdmin = auth.isAdmin;

const app = express();

// Express File-Upload middleware
app.use(fileUpload());

// get book module
var Book = require("../models/book");

// GET books index
router.get("/", isAdmin, function (req, res) {
  var count;

  Book.countDocuments(function (err, c) {
    count = c;
  });

  Book.find(function (err, books) {
    res.render("../admin/books", {
      books: books,
      count: count,
    });
  });
});

// GET add book
router.get("/add-book", isAdmin, function (req, res) {
  var title = "";
  var desc = "";

  // Category.find(function(err, categories){
  res.render("../admin/add_book", {
    title: title,
    desc: desc,
    // categories: categories
  });
  // });
});

// POST add book
router.post("/add-book", function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    // var imageFile = typeof req.files.target_file !== "undefined" ? req.files.target_file.name : "";
    var imageFile = "";
    var bookFile = "";
  } else {
    var imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
    var bookFile =
      typeof req.files.book !== "undefined" ? req.files.book.name : "";
  }

  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();
  req.checkBody("image", "You must upload an image").isImage(imageFile);
  req.checkBody("book", "You must upload a Book").isFile(bookFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;

  var errors = req.validationErrors();

  if (errors) {
    res.render("../admin/add_book", {
      errors: errors,
      title: title,
      desc: desc,
    });
    // });
  } else {
    Book.findOne({ slug: slug }, function (err, book) {
      if (book) {
        req.flash("danger", "Book title exists, choose another.");
        // Category.find(function(err, categories){
        res.render("../admin/add_book", {
          title: title,
          desc: desc,
          // categories: categories
        });
        // });
      } else {
        // const today = new Date();
        // const options = {weekday: "short", day: "numeric", month: "short", year: "numeric"}
        // const date = today.toLocaleDateString("en-us", options);

        var book = new Book({
          title: title,
          slug: slug,
          desc: desc,
          image: imageFile,
          file: bookFile,
          // date: date
        });

        book.save(function (err) {
          if (err) return console.log(err);

          fs.mkdir(
            "public/book_images/" + book._id,
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          fs.mkdir(
            "public/book_images/" + book._id + "/book",
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          fs.mkdir(
            "public/book_images/" + book._id + "/gallery",
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          fs.mkdir(
            "public/book_images/" + book._id + "/gallery/thumbs",
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );

          if (imageFile != "") {
            var previewImage = req.files.image;
            var Uploadpath = "public/book_images/" + book._id + "/" + imageFile;

            previewImage.mv(Uploadpath, (err) => {
              if (err) return console.log(err);
            });
          }

          if (bookFile != "") {
            var uploadedBook = req.files.book;
            var Uploadpath =
              "public/book_images/" + book._id + "/book/" + bookFile;

            uploadedBook.mv(Uploadpath, (err) => {
              if (err) return console.log(err);
            });
          }

          req.flash("success", "Book added!");
          res.redirect("/admin/books");
        });
      }
    });
  }
});

// GET edit book
router.get("/edit-book/:id", isAdmin, function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  // Category.find(function(err, categories){

  Book.findById(req.params.id, function (err, p) {
    if (err) {
      console.log(err);
      res.redirect("/admin/books");
    } else {
      var galleryDir = "public/book_images/" + p._id + "/gallery";
      var galleryImages = null;

      fs.readdir(galleryDir, function (err, files) {
        if (err) {
          console.log(err);
        } else {
          galleryImages = files;

          res.render("../admin/edit_book", {
            title: p.title,
            errors: errors,
            desc: p.desc,
            // categories: categories,
            // category: p.category.replace(/\s+/g, '-').toLowerCase(),
            image: p.image,
            file: p.file,
            galleryImages: galleryImages,
            id: p._id,
          });
        }
      });
    }
  });
  // });
});

// POST edit book
router.post("/edit-book/:id", function (req, res) {
  var imageFile;
  var bookFile;

  if (!req.files || Object.keys(req.files).length === 0) {
    imageFile = "";
    bookFile = "";
  } else {
    imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
    bookFile = typeof req.files.book !== "undefined" ? req.files.book.name : "";
  }

  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var pimage = req.body.pimage;
  var pfile = req.body.pfile;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect("/admin/books/edit-book/" + id);
  } else {
    Book.findOne({ slug: slug, _id: { $ne: id } }, function (err, p) {
      if (err) console.log(err);
      if (p) {
        req.flash("danger", "Book Title exists, choose another.");
        res.redirect("/admin/books/edit-book/" + id);
      } else {
        Book.findById(id, function (err, p) {
          if (err) console.log(err);
          p.title = title;
          p.slug = slug;
          p.desc = desc;
          // p.category = category;

          if (imageFile == "") {
            p.image = pimage;
          }

          if (imageFile != "") {
            p.image = imageFile;
          }
          if (bookFile != "") {
            p.file = bookFile;
          }

          fs.mkdir("public/book_images/" + id, { recursive: true }, (err) => {
            if (err) throw err;
          });

          p.save(function (err) {
            if (err) console.log(err);

            if (imageFile != "") {
              if (pimage != "") {
                fs.rm(
                  "public/book_images/" + id + "/" + pimage,
                  function (err) {
                    if (err) console.log(err);

                    var previewImage = req.files.image;
                    var Uploadpath =
                      "public/book_images/" + id + "/" + imageFile;

                    previewImage.mv(Uploadpath, (err) => {
                      if (err) return console.log(err);
                    });
                  }
                );
              }
            }

            if (bookFile != "") {
              if (pfile != "") {
                fs.rm(
                  "public/book_images/" + id + "/book/" + pfile,
                  function (err) {
                    if (err) console.log(err);

                    var uploadedBook = req.files.book;
                    var Uploadpath =
                      "public/book_images/" + id + "/book/" + bookFile;

                    uploadedBook.mv(Uploadpath, (err) => {
                      if (err) return console.log(err);
                    });
                  }
                );
              }
            }

            req.flash("success", "Book edited!");
            res.redirect("/admin/books/edit-book/" + id);
          });
        });
      }
    });
  }
});

// POST book gallery
router.post("/book-gallery/:id", function (req, res) {
  var bookImage = req.files.file;
  var id = req.params.id;
  var path1 = "public/book_images/" + id + "/gallery/" + bookImage.name;
  var thumbsPath =
    "public/book_images/" + id + "/gallery/thumbs/" + bookImage.name;

  bookImage.mv(path1, function (err) {
    if (err) console.log(err);
    resizeImg(fse.readFileSync(path1), { width: 100, height: 100 }).then(
      function (buf) {
        fse.writeFileSync(thumbsPath, buf);
      }
    );
  });

  res.sendStatus(200);
});

// GET delete image
router.get("/delete-image/:image", isAdmin, function (req, res) {
  var originalImage =
    "public/book_images/" + req.query.id + "/gallery/" + req.params.image;
  var thumbImage =
    "public/book_images/" +
    req.query.id +
    "/gallery/thumbs/" +
    req.params.image;

  fse.remove(originalImage, function (err) {
    if (err) {
      console.log(err);
    } else {
      fse.remove(thumbImage, function (err) {
        if (err) {
          console.log(err);
        } else {
          req.flash("success", "Image deleted!");
          res.redirect("/admin/books/edit-book/" + req.query.id);
        }
      });
    }
  });
});

// GET delete book
router.get("/delete-book/:id", isAdmin, function (req, res) {
  var id = req.params.id;
  var path1 = "public/book_images/" + id;

  fse.remove(path1, function (err) {
    if (err) {
      console.log(err);
    } else {
      Book.findByIdAndRemove(id, function (err) {
        if (err) return console.log(err);

        req.flash("success", "Book Deleted!");
        res.redirect("/admin/books");
      });
    }
  });
});

// Exports
module.exports = router;
