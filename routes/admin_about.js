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

// get About module
var About = require("../models/about");

// GET about index
router.get("/", isAdmin, function (req, res) {
  var count;

  About.countDocuments(function (err, c) {
    count = c;
  });

  About.find(function (err, abouts) {
    res.render("../admin/about", {
      abouts: abouts,
      count: count,
    });
  });
});

// GET add about
router.get("/add-about", isAdmin, function (req, res) {
  var title = "";
  var desc = "";

  res.render("../admin/add_about", {
    title: title,
    desc: desc,
  });
});

// POST add About
router.post("/add-about", function (req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;

  var errors = req.validationErrors();

  if (errors) {
    res.render("../admin/add_about", {
      errors: errors,
      title: title,
      desc: desc,
    });
  } else {
    About.findOne({ slug: slug }, function (err, about) {
      if (about) {
        req.flash("danger", "About title exists, choose another.");
        res.render("../admin/add_about", {
          title: title,
          desc: desc,
        });
      } else {
        var about = new About({
          title: title,
          slug: slug,
          desc: desc,
        });

        about.save(function (err) {
          if (err) return console.log(err);
          req.flash("success", "About me added!");
          res.redirect("/admin/about");
        });
      }
    });
  }
});

// GET edit about
router.get("/edit-about/:id", isAdmin, function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  About.findById(req.params.id, function (err, p) {
    if (err) {
      console.log(err);
      res.redirect("/admin/about");
    } else {
      res.render("../admin/edit_about", {
        title: p.title,
        errors: errors,
        desc: p.desc,
        slug: p.slug,
        id: p._id,
      });
    }
  });
});

// POST edit About
router.post("/edit-about/:id", function (req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect("/admin/about/edit-about/" + id);
  } else {
    About.findOne({ slug: slug, _id: { $ne: id } }, function (err, p) {
      if (err) console.log(err);
      if (p) {
        req.flash("danger", "About Me Title exists, choose another!.");
        res.redirect("/admin/about/edit-about/" + id);
      } else {
        About.findById(id, function (err, p) {
          if (err) console.log(err);
          p.title = title;
          p.slug = slug;
          p.desc = desc;

          p.save(function (err) {
            if (err) console.log(err);

            req.flash("success", "About Me edited!");
            res.redirect("/admin/about/edit-about/" + id);
          });
        });
      }
    });
  }
});

// GET delete about
router.get("/delete-about/:id", isAdmin, function (req, res) {
  var id = req.params.id;

  About.findByIdAndRemove(id, function (err) {
    if (err) return console.log(err);

    req.flash("success", "About Me Deleted!");
    res.redirect("/admin/about");
  });
});

// Exports
module.exports = router;
