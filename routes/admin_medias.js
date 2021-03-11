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

// get media module
var Media = require("../models/media");

// GET medias index
router.get("/", isAdmin, function (req, res) {
  var count;

  Media.countDocuments(function (err, c) {
    count = c;
  });

  Media.find(function (err, medias) {
    res.render("../admin/medias", {
      medias: medias,
      count: count,
    });
  });
});

// GET add media
router.get("/add-media", isAdmin, function (req, res) {
  var title = "";
  var desc = "";

  // Category.find(function(err, categories){
  res.render("../admin/add_media", {
    title: title,
    desc: desc,
    // categories: categories
  });
  // });
});

// POST add media
router.post("/add-media", function (req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  // var category = req.body.category;
  var link = req.body.link;
  var site = req.body.site;

  var errors = req.validationErrors();

  if (errors) {
    // Category.find(function(err, categories){
    res.render("../admin/add_media", {
      errors: errors,
      title: title,
      desc: desc,
      // categories: categories
    });
    // });
  } else {
    Media.findOne({ slug: slug }, function (err, media) {
      if (media) {
        req.flash("danger", "Media link exists, choose another.");
        // Category.find(function(err, categories){
        res.render("../admin/add_media", {
          title: title,
          desc: desc,
          link: link,
          site: site,
          // categories: categories
        });
        // });
      } else {
        // generates random number for book
        var random = Math.floor(Math.random() * 100 + 1);

        var media = new Media({
          title: title,
          slug: slug,
          desc: desc,
          // category: category,
          link: link,
          site: site,
          rand: random,
        });

        media.save(function (err) {
          if (err) return console.log(err);

          // fs.mkdir("public/book_images/" + book._id, { recursive: true }, (err) => {
          //     if (err) throw err;
          //   });
          // fs.mkdir("public/book_images/" + book._id + "/book", { recursive: true }, (err) => {
          //     if (err) throw err;
          //   });
          // fs.mkdir("public/book_images/" + book._id + "/gallery", { recursive: true }, (err) => {
          //     if (err) throw err;
          //   });
          // fs.mkdir("public/book_images/" + book._id + "/gallery/thumbs", { recursive: true }, (err) => {
          //     if (err) throw err;
          //   });

          // if (imageFile != "") {
          //     var previewImage = req.files.image;
          //     var Uploadpath = "public/book_images/" + book._id + "/" + imageFile;

          //     // var path1 = path.join(__dirname, "public/book_images/", book._id , bookImage.name);
          //     // bookImage.mv(path, function(err){
          //     //     return console.log(err);
          //     // });
          //     // var path1 = path.join(__dirname, "public/book_images/", book._id , bookImage.name);
          //     previewImage.mv(Uploadpath, (err) => {
          //         if(err)
          //             return console.log(err);
          //     });
          // }

          // if (bookFile != "") {
          //     var uploadedBook = req.files.book;
          //     var Uploadpath = "public/book_images/" + book._id + "/book/" + bookFile;

          //     // var path1 = path.join(__dirname, "public/book_images/", book._id , bookImage.name);
          //     // bookImage.mv(path, function(err){
          //     //     return console.log(err);
          //     // });
          //     // var path1 = path.join(__dirname, "public/book_images/", book._id , bookImage.name);
          //     uploadedBook.mv(Uploadpath, (err) => {
          //         if(err)
          //             return console.log(err);
          //     });
          //     // console.log(bookFile);

          // }

          req.flash("success", "Media added!");
          res.redirect("/admin/medias");
        });
      }
    });
  }
});

// GET edit media
router.get("/edit-media/:id", isAdmin, function (req, res) {
  var errors;

  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  // Category.find(function(err, categories){

  Media.findById(req.params.id, function (err, p) {
    if (err) {
      console.log(err);
      res.redirect("/admin/medias");
    } else {
      // var galleryDir = "public/book_images/" + p._id + "/gallery"
      // var galleryImages = null;

      // fs.readdir(galleryDir, function (err, files){
      //     if (err) {
      //         console.log(err);
      //     } else {
      //         galleryImages = files;

      res.render("../admin/edit_media", {
        title: p.title,
        errors: errors,
        desc: p.desc,
        // categories: categories,
        // category: p.category.replace(/\s+/g, '-').toLowerCase(),
        link: p.link,
        site: p.site,
        id: p._id,
      });
      // }

      // });
    }
  });
  // });
});

// POST edit media
router.post("/edit-media/:id", function (req, res) {
  req.checkBody("title", "Title must have a value").notEmpty();
  req.checkBody("desc", "Description must have a value").notEmpty();
  // req.checkBody('image', 'You must upload an image').isFile(imageFile);
  // req.checkBody('book', 'You must upload a Book').isFile(bookFile);

  var title = req.body.title;
  var slug = title.replace(/\s+/g, "-").toLowerCase();
  var desc = req.body.desc;
  // var category = req.body.category;
  var link = req.body.link;
  var link = req.body.site;
  var id = req.params.id;

  var errors = req.validationErrors();

  if (errors) {
    req.session.errors = errors;
    res.redirect("/admin/medias/edit-media/" + id);
  } else {
    Media.findOne({ slug: slug, _id: { $ne: id } }, function (err, p) {
      if (err) console.log(err);
      if (p) {
        req.flash("danger", "Media link exists, choose another.");
        res.redirect("/admin/books/edit-media/" + id);
      } else {
        Media.findById(id, function (err, p) {
          if (err) console.log(err);
          p.title = title;
          p.slug = slug;
          p.desc = desc;
          if (link == "") {
            p.link = p.link;
          } else {
            p.link = link;
          }
          if (site == "") {
            p.site = p.site;
          } else {
            p.site = site;
          }
          // p.category = category;

          p.save(function (err) {
            if (err) console.log(err);

            // if(imageFile != ""){
            //     if (pimage != ""){
            //         fs.rm("public/book_images/" + id + "/" + pimage , function(err){
            //             if (err) console.log(err);

            //             var previewImage = req.files.image;
            //             var Uploadpath = "public/book_images/" + id + "/" + imageFile;

            //             previewImage.mv(Uploadpath, (err) => {
            //                 if(err)
            //                     return console.log(err);
            //             });
            //         })
            //     }
            // }

            // if(bookFile != ""){
            //     if (pfile != ""){
            //         fs.rm("public/book_images/" + id + "/book/" + pfile , function(err){
            //             if (err) console.log(err);

            //             var uploadedBook = req.files.book;
            //             var Uploadpath = "public/book_images/" + id + "/book/" + bookFile;

            //             uploadedBook.mv(Uploadpath, (err) => {
            //                 if(err)
            //                     return console.log(err);
            //             });
            //         })
            //     }
            // }

            req.flash("success", "Media link edited!");
            res.redirect("/admin/medias/edit-media/" + id);
          });
        });
      }
    });
  }
});

// GET delete media Link
router.get("/delete-media/:id", isAdmin, function (req, res) {
  var id = req.params.id;

  Media.findByIdAndRemove(id, function (err) {
    if (err) return console.log(err);

    req.flash("success", "Media Deleted!");
    res.redirect("/admin/medias");
  });
});

// Exports
module.exports = router;
