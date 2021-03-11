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

// get Research module
var Research = require("../models/research");

// GET Research index
router.get("/", isAdmin, function (req, res) {
  var count;

  Research.countDocuments(function (err, c) {
    count = c;
  });

  Research.find(function (err, researches) {
    res.render("../admin/research", {
      researches: researches,
      count: count,
    });
  });
});

// GET add research
router.get("/add-research", isAdmin, function (req, res) {
  var title = "";
  var desc = "";

  res.render("../admin/add_research", {
    title: title,
    desc: desc,
  });
});

// POST add research
router.post("/add-research", function (req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;

  var errors = req.validationErrors();

  if (errors) {
    res.render("../admin/add_research", {
      errors: errors,
      title: title,
      desc: desc,
    });
  } else {
    Research.findOne({ slug: slug }, function (err, research) {
      if (research) {
        req.flash("danger", "Research title exists, choose another.");
        res.render("../admin/add_research", {
          title: title,
          desc: desc,
        });
      } else {
        var research = new Research({
          title: title,
          slug: slug,
          desc: desc,
        });

        research.save(function (err) {
          if (err) return console.log(err);
          req.flash("success", "Research Interest added!");
          res.redirect("/admin/research");
        });
      }
    });
  }
});

// GET edit research
router.get("/edit-research/:id", isAdmin, function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Research.findById(req.params.id, function (err, p) {
    if (err) {
      console.log(err);
      res.redirect("/admin/research");
    } else {
      res.render("../admin/edit_research", {
        title: p.title,
        errors: errors,
        desc: p.desc,
        slug: p.slug,
        id: p._id,
      });
    }
  });
});

// POST edit research
router.post("/edit-research/:id", function (req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect("/admin/research/edit-research/" + id);
  } else {
    Research.findOne({ slug: slug, _id: { $ne: id } }, function (err, p) {
      if (err) console.log(err);
      if (p) {
        req.flash("danger", "Research Interest Title exists, choose another!.");
        res.redirect("/admin/research/edit-research/" + id);
      } else {
        Research.findById(id, function (err, p) {
          if (err) console.log(err);
          p.title = title;
          p.slug = slug;
          p.desc = desc;

          p.save(function (err) {
            if (err) console.log(err);

            req.flash("success", "Research Interest edited!");
            res.redirect("/admin/research/edit-research/" + id);
          });
        });
      }
    });
  }
});

// GET delete research
router.get("/delete-research/:id", isAdmin, function (req, res) {
  var id = req.params.id;

  Research.findByIdAndRemove(id, function (err) {
    if (err) return console.log(err);

    req.flash("success", "Research Interest Deleted!");
    res.redirect("/admin/research");
  });
});

// Exports
module.exports = router;
