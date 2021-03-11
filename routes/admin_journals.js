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

// get journal module
var Journal = require("../models/journal");

// GET journals index
router.get("/", isAdmin, function (req, res) {
  var count;

  Journal.countDocuments(function (err, c) {
    count = c;
  });

  Journal.find(function (err, journals) {
    res.render("../admin/journals", {
      journals: journals,
      count: count,
    });
  });
});

// GET add journal
router.get("/add-journal", isAdmin, function (req, res) {
  var title = "";
  var desc = "";

  res.render("../admin/add_journal", {
    title: title,
    desc: desc,
  });
});

// POST add journal
router.post("/add-journal", function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    var imageFile = "";
    var journalFile = "";
  } else {
    var imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
    var journalFile =
      typeof req.files.journal !== "undefined" ? req.files.journal.name : "";
  }

  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();
  req.checkBody("image", "You must upload an image").isImage(imageFile);
  req.checkBody("journal", "You must upload a Journal").isFile(journalFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;

  var errors = req.validationErrors();

  if (errors) {
    res.render("../admin/add_journal", {
      errors: errors,
      title: title,
      desc: desc,
    });
    // });
  } else {
    Journal.findOne({ slug: slug }, function (err, journal) {
      if (journal) {
        req.flash("danger", "Journal title exists, choose another.");
        res.render("../admin/add_journal", {
          title: title,
          desc: desc,
        });
      } else {
        // const today = new Date();
        // const options = {weekday: "short", day: "numeric", month: "short", year: "numeric"}
        // const date = today.toLocaleDateString("en-us", options);

        var journal = new Journal({
          title: title,
          slug: slug,
          desc: desc,
          image: imageFile,
          file: journalFile,
        });

        journal.save(function (err) {
          if (err) return console.log(err);

          fs.mkdir(
            "public/journal_images/" + journal._id,
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          fs.mkdir(
            "public/journal_images/" + journal._id + "/journal",
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          fs.mkdir(
            "public/journal_images/" + journal._id + "/gallery",
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          fs.mkdir(
            "public/journal_images/" + journal._id + "/gallery/thumbs",
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );

          if (imageFile != "") {
            var previewImage = req.files.image;
            var Uploadpath =
              "public/journal_images/" + journal._id + "/" + imageFile;

            previewImage.mv(Uploadpath, (err) => {
              if (err) return console.log(err);
            });
          }

          if (journalFile != "") {
            var uploadedJournal = req.files.journal;
            var Uploadpath =
              "public/journal_images/" +
              journal._id +
              "/journal/" +
              journalFile;

            uploadedJournal.mv(Uploadpath, (err) => {
              if (err) return console.log(err);
            });
          }

          req.flash("success", "Journal added!");
          res.redirect("/admin/journals");
        });
      }
    });
  }
});

// GET edit journal
router.get("/edit-journal/:id", isAdmin, function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Journal.findById(req.params.id, function (err, p) {
    if (err) {
      console.log(err);
      res.redirect("/admin/journals");
    } else {
      var galleryDir = "public/journal_images/" + p._id + "/gallery";
      var galleryImages = null;

      fs.readdir(galleryDir, function (err, files) {
        if (err) {
          console.log(err);
        } else {
          galleryImages = files;

          res.render("../admin/edit_journal", {
            title: p.title,
            errors: errors,
            desc: p.desc,
            image: p.image,
            file: p.file,
            galleryImages: galleryImages,
            id: p._id,
          });
        }
      });
    }
  });
});

// POST edit journal
router.post("/edit-journal/:id", function (req, res) {
  var imageFile;
  var journalFile;

  if (!req.files || Object.keys(req.files).length === 0) {
    imageFile = "";
    journalFile = "";
  } else {
    imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
    journalFile =
      typeof req.files.journal !== "undefined" ? req.files.journal.name : "";
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
    res.redirect("/admin/journals/edit-journal/" + id);
  } else {
    Journal.findOne({ slug: slug, _id: { $ne: id } }, function (err, p) {
      if (err) console.log(err);
      if (p) {
        req.flash("danger", "Journal Title exists, choose another.");
        res.redirect("/admin/journals/edit-journal/" + id);
      } else {
        Journal.findById(id, function (err, p) {
          if (err) console.log(err);
          p.title = title;
          p.slug = slug;
          p.desc = desc;

          if (imageFile == "") {
            p.image = pimage;
          }

          if (imageFile != "") {
            p.image = imageFile;
          }
          if (journalFile != "") {
            p.file = journalFile;
          }

          fs.mkdir(
            "public/journal_images/" + id,
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );

          p.save(function (err) {
            if (err) console.log(err);

            if (imageFile != "") {
              if (pimage != "") {
                fs.rm(
                  "public/journal_images/" + id + "/" + pimage,
                  function (err) {
                    if (err) console.log(err);

                    var previewImage = req.files.image;
                    var Uploadpath =
                      "public/journal_images/" + id + "/" + imageFile;

                    previewImage.mv(Uploadpath, (err) => {
                      if (err) return console.log(err);
                    });
                  }
                );
              }
            }

            if (journalFile != "") {
              if (pfile != "") {
                fs.rm(
                  "public/journal_images/" + id + "/journal/" + pfile,
                  function (err) {
                    if (err) console.log(err);

                    var uploadedJournal = req.files.journal;
                    var Uploadpath =
                      "public/journal_images/" + id + "/journal/" + journalFile;

                    uploadedJournal.mv(Uploadpath, (err) => {
                      if (err) return console.log(err);
                    });
                  }
                );
              }
            }

            req.flash("success", "Journal edited!");
            res.redirect("/admin/journals/edit-journal/" + id);
          });
        });
      }
    });
  }
});

// POST journal gallery
router.post("/journal-gallery/:id", function (req, res) {
  var journalImage = req.files.file;
  var id = req.params.id;
  var path1 = "public/journal_images/" + id + "/gallery/" + journalImage.name;
  var thumbsPath =
    "public/journal_images/" + id + "/gallery/thumbs/" + journalImage.name;

  journalImage.mv(path1, function (err) {
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
    "public/journal_images/" + req.query.id + "/gallery/" + req.params.image;
  var thumbImage =
    "public/journal_images/" +
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
          res.redirect("/admin/journals/edit-journal/" + req.query.id);
        }
      });
    }
  });
});

// GET delete journal
router.get("/delete-journal/:id", isAdmin, function (req, res) {
  var id = req.params.id;
  var path1 = "public/journal_images/" + id;

  fse.remove(path1, function (err) {
    if (err) {
      console.log(err);
    } else {
      Journal.findByIdAndRemove(id, function (err) {
        if (err) return console.log(err);

        req.flash("success", "Journal Deleted!");
        res.redirect("/admin/journals");
      });
    }
  });
});

// Exports
module.exports = router;
