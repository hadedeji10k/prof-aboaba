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

// get resources module
var Resources = require("../models/resources");

// GET Resources index
router.get("/", isAdmin, function (req, res) {
  var count;

  Resources.countDocuments(function (err, c) {
    count = c;
  });

  Resources.find(function (err, resources) {
    res.render("../admin/resources", {
      resources: resources,
      count: count,
    });
  });
});

// GET add resources
router.get("/add-resources", isAdmin, function (req, res) {
  var title = "";
  var desc = "";
  var link = "";

  res.render("../admin/add_resources", {
    title: title,
    desc: desc,
    link: link,
  });
});

// POST add resources
router.post("/add-resources", function (req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();
  req.checkBody("link", "You must Give a valid Link").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var link = req.body.link;

  var errors = req.validationErrors();

  if (errors) {
    res.render("../admin/add_resources", {
      errors: errors,
      title: title,
      desc: desc,
      link: link,
    });
  } else {
    Resources.findOne({ slug: slug }, function (err, resource) {
      if (resource) {
        req.flash("danger", "Resource title exists, choose another.");
        res.render("../admin/add_resources", {
          title: title,
          desc: desc,
        });
      } else {
        var resource = new Resources({
          title: title,
          slug: slug,
          desc: desc,
          link: link,
        });

        resource.save(function (err) {
          if (err) return console.log(err);

          req.flash("success", "Resource added!");
          res.redirect("/admin/resources");
        });
      }
    });
  }
});

// GET edit resources
router.get("/edit-resources/:id", isAdmin, function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Resources.findById(req.params.id, function (err, p) {
    if (err) {
      console.log(err);
      res.redirect("/admin/resources");
    } else {
      res.render("../admin/edit_resources", {
        title: p.title,
        errors: errors,
        desc: p.desc,
        link: p.link,
        id: p._id,
      });
    }
  });
});

// POST edit resources
router.post("/edit-resources/:id", function (req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();
  req.checkBody("link", "Link must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  var link = req.body.link;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect("/admin/resources/edit-resources/" + id);
  } else {
    Resources.findOne({ slug: slug, _id: { $ne: id } }, function (err, p) {
      if (err) console.log(err);
      if (p) {
        req.flash("danger", "Resources Title exists, choose another!.");
        res.redirect("/admin/resources/edit-resources/" + id);
      } else {
        Resources.findById(id, function (err, p) {
          if (err) console.log(err);
          p.title = title;
          p.slug = slug;
          p.desc = desc;

          if (link == "") {
            p.link = plink;
          }

          if (link != "") {
            p.link = link;
          }

          p.save(function (err) {
            if (err) console.log(err);

            req.flash("success", "Resource edited!");
            res.redirect("/admin/resources/edit-resources/" + id);
          });
        });
      }
    });
  }
});

// GET delete resources
router.get("/delete-resources/:id", isAdmin, function (req, res) {
  var id = req.params.id;

  Resources.findByIdAndRemove(id, function (err) {
    if (err) return console.log(err);

    req.flash("success", "Resource Deleted!");
    res.redirect("/admin/resources");
  });
});

// Exports
module.exports = router;
