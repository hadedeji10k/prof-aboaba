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

// get conference module
var Conference = require("../models/conference");

// GET conference index
router.get("/", isAdmin, function (req, res) {
  var count;

  Conference.countDocuments(function (err, c) {
    count = c;
  });

  Conference.find(function (err, conferences) {
    res.render("../admin/conferences", {
      conferences: conferences,
      count: count,
    });
  });
});

// GET add conference
router.get("/add-conference", isAdmin, function (req, res) {
  var title = "";
  var desc = "";

  res.render("../admin/add_conference", {
    title: title,
    desc: desc,
  });
});

// POST add conference
router.post("/add-conference", function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    var imageFile = "";
    var conferenceFile = "";
  } else {
    var imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
    var conferenceFile =
      typeof req.files.conference !== "undefined"
        ? req.files.conference.name
        : "";
  }

  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();
  req.checkBody("image", "You must upload an image").isImage(imageFile);
  req
    .checkBody("conference", "You must upload a Conference")
    .isFile(conferenceFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;

  var errors = req.validationErrors();

  if (errors) {
    res.render("../admin/add_conference", {
      errors: errors,
      title: title,
      desc: desc,
    });
    // });
  } else {
    Conference.findOne({ slug: slug }, function (err, conference) {
      if (conference) {
        req.flash("danger", "Conference title exists, choose another.");
        res.render("../admin/add_conference", {
          title: title,
          desc: desc,
        });
      } else {
        // const today = new Date();
        // const options = {weekday: "short", day: "numeric", month: "short", year: "numeric"}
        // const date = today.toLocaleDateString("en-us", options);

        var conference = new Conference({
          title: title,
          slug: slug,
          desc: desc,
          image: imageFile,
          file: conferenceFile,
        });

        conference.save(function (err) {
          if (err) return console.log(err);

          fs.mkdir(
            "public/conference_images/" + conference._id,
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          fs.mkdir(
            "public/conference_images/" + conference._id + "/conference",
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          fs.mkdir(
            "public/conference_images/" + conference._id + "/gallery",
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );
          fs.mkdir(
            "public/conference_images/" + conference._id + "/gallery/thumbs",
            { recursive: true },
            (err) => {
              if (err) throw err;
            }
          );

          if (imageFile != "") {
            var previewImage = req.files.image;
            var Uploadpath =
              "public/conference_images/" + conference._id + "/" + imageFile;

            previewImage.mv(Uploadpath, (err) => {
              if (err) return console.log(err);
            });
          }

          if (conferenceFile != "") {
            var uploadedConference = req.files.conference;
            var Uploadpath =
              "public/conference_images/" +
              conference._id +
              "/conference/" +
              conferenceFile;

            uploadedConference.mv(Uploadpath, (err) => {
              if (err) return console.log(err);
            });
          }

          req.flash("success", "Conference added!");
          res.redirect("/admin/conferences");
        });
      }
    });
  }
});

// GET edit conference
router.get("/edit-conference/:id", isAdmin, function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Conference.findById(req.params.id, function (err, p) {
    if (err) {
      console.log(err);
      res.redirect("/admin/conferences");
    } else {
      var galleryDir = "public/conference_images/" + p._id + "/gallery";
      var galleryImages = null;

      fs.readdir(galleryDir, function (err, files) {
        if (err) {
          console.log(err);
        } else {
          galleryImages = files;

          res.render("../admin/edit_conference", {
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

// POST edit conference
router.post("/edit-conference/:id", function (req, res) {
  var imageFile;
  var conferenceFile;

  if (!req.files || Object.keys(req.files).length === 0) {
    imageFile = "";
    conferenceFile = "";
  } else {
    imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
    conferenceFile =
      typeof req.files.conference !== "undefined"
        ? req.files.conference.name
        : "";
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
    res.redirect("/admin/conferences/edit-conference/" + id);
  } else {
    Conference.findOne({ slug: slug, _id: { $ne: id } }, function (err, p) {
      if (err) console.log(err);
      if (p) {
        req.flash("danger", "Conference Title exists, choose another.");
        res.redirect("/admin/conferences/edit-conference/" + id);
      } else {
        Conference.findById(id, function (err, p) {
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
          if (conferenceFile != "") {
            p.file = conferenceFile;
          }

          fs.mkdir(
            "public/conference_images/" + id,
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
                  "public/conference_images/" + id + "/" + pimage,
                  function (err) {
                    if (err) console.log(err);

                    var previewImage = req.files.image;
                    var Uploadpath =
                      "public/conference_images/" + id + "/" + imageFile;

                    previewImage.mv(Uploadpath, (err) => {
                      if (err) return console.log(err);
                    });
                  }
                );
              }
            }

            if (conferenceFile != "") {
              if (pfile != "") {
                fs.rm(
                  "public/conference_images/" + id + "/conference/" + pfile,
                  function (err) {
                    if (err) console.log(err);

                    var uploadedConference = req.files.conference;
                    var Uploadpath =
                      "public/conference_images/" +
                      id +
                      "/conference/" +
                      conferenceFile;

                    uploadedConference.mv(Uploadpath, (err) => {
                      if (err) return console.log(err);
                    });
                  }
                );
              }
            }

            req.flash("success", "Conference edited!");
            res.redirect("/admin/conferences/edit-conference/" + id);
          });
        });
      }
    });
  }
});

// POST conference gallery
router.post("/conference-gallery/:id", function (req, res) {
  var conferenceImage = req.files.file;
  var id = req.params.id;
  var path1 =
    "public/conference_images/" + id + "/gallery/" + conferenceImage.name;
  var thumbsPath =
    "public/conference_images/" +
    id +
    "/gallery/thumbs/" +
    conferenceImage.name;

  conferenceImage.mv(path1, function (err) {
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
    "public/conference_images/" + req.query.id + "/gallery/" + req.params.image;
  var thumbImage =
    "public/conference_images/" +
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
          res.redirect("/admin/conferences/edit-conference/" + req.query.id);
        }
      });
    }
  });
});

// GET delete conference
router.get("/delete-conference/:id", isAdmin, function (req, res) {
  var id = req.params.id;
  var path1 = "public/conference_images/" + id;

  fse.remove(path1, function (err) {
    if (err) {
      console.log(err);
    } else {
      Conference.findByIdAndRemove(id, function (err) {
        if (err) return console.log(err);

        req.flash("success", "Conference Deleted!");
        res.redirect("/admin/conferences");
      });
    }
  });
});

// Exports
module.exports = router;
