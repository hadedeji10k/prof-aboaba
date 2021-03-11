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

// get carousel module
var Carousel = require("../models/carousel");

// GET Carousel index
router.get("/", isAdmin, function (req, res) {
  var count;

  Carousel.countDocuments(function (err, c) {
    count = c;
  });

  Carousel.find(function (err, carousels) {
    res.render("../admin/carousel", {
      carousels: carousels,
      count: count,
    });
  });
});

// GET add carousel
router.get("/add-carousel", isAdmin, function (req, res) {
  var title = "";
  var desc = "";

  res.render("../admin/add_carousel", {
    title: title,
    desc: desc,
  });
});

// POST add carousel
router.post("/add-carousel", function (req, res) {
  if (!req.files || Object.keys(req.files).length === 0) {
    var carouselImage = "";
  } else {
    var carouselImage =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
  }

  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();
  req.checkBody("image", "You must upload an image").isImage(carouselImage);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;

  var errors = req.validationErrors();

  if (errors) {
    res.render("../admin/add_carousel", {
      errors: errors,
      title: title,
      desc: desc,
    });
  } else {
    Carousel.findOne({ slug: slug }, function (err, carousel) {
      if (carousel) {
        req.flash("danger", "Carousel title exists, choose another.");
        res.render("../admin/add_carousel", {
          title: title,
          desc: desc,
        });
      } else {
        var carousel = new Carousel({
          title: title,
          slug: slug,
          desc: desc,
          image: carouselImage,
        });

        carousel.save(function (err) {
          if (err) return console.log(err);

          if (carouselImage != "") {
            var previewImage = req.files.image;
            var Uploadpath = "public/carousel_images/" + carouselImage;

            previewImage.mv(Uploadpath, (err) => {
              if (err) return console.log(err);
            });
          }

          req.flash("success", "Carousel added!");
          res.redirect("/admin/carousel");
        });
      }
    });
  }
});

// GET edit carousel
router.get("/edit-carousel/:id", isAdmin, function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Carousel.findById(req.params.id, function (err, p) {
    if (err) {
      console.log(err);
      res.redirect("/admin/carousel");
    } else {
      res.render("../admin/edit_carousel", {
        title: p.title,
        errors: errors,
        desc: p.desc,
        image: p.image,
        id: p._id,
      });
    }
  });
});

// POST edit Carousel
router.post("/edit-carousel/:id", function (req, res) {
  var carouselImage;

  if (!req.files || Object.keys(req.files).length === 0) {
    carouselImage = "";
  } else {
    carouselImage =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
  }

  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var pimage = req.body.pimage;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect("/admin/carousel/edit-carousel/" + id);
  } else {
    Carousel.findOne({ slug: slug, _id: { $ne: id } }, function (err, p) {
      if (err) console.log(err);
      if (p) {
        req.flash("danger", "Carousel Title exists, choose another!.");
        res.redirect("/admin/carousel/edit-carousel/" + id);
      } else {
        Carousel.findById(id, function (err, p) {
          if (err) console.log(err);
          p.title = title;
          p.slug = slug;
          p.desc = desc;

          if (carouselImage == "") {
            p.image = pimage;
          }

          if (carouselImage != "") {
            p.image = carouselImage;
          }

          p.save(function (err) {
            if (err) console.log(err);

            if (carouselImage != "") {
              if (pimage != "") {
                fs.rm("public/carousel_images/" + pimage, function (err) {
                  if (err) console.log(err);

                  var previewImage = req.files.image;
                  var Uploadpath = "public/carousel_images/" + carouselImage;

                  previewImage.mv(Uploadpath, (err) => {
                    if (err) return console.log(err);
                  });
                });
              }
            }

            req.flash("success", "Carousel edited!");
            res.redirect("/admin/carousel/edit-carousel/" + id);
          });
        });
      }
    });
  }
});

// GET delete carousel
router.get("/delete-carousel/:image/:id", isAdmin, function (req, res) {
  var image = req.params.image;
  var id = req.params.id;
  var path1 = "public/carousel_images/" + image;

  fse.remove(path1, function (err) {
    if (err) {
      console.log(err);
    } else {
      Carousel.findByIdAndRemove(id, function (err) {
        if (err) return console.log(err);

        req.flash("success", "Carousel Deleted!");
        res.redirect("/admin/carousel");
      });
    }
  });
});

// Exports
module.exports = router;
