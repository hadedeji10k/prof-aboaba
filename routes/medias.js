const express = require("express");
const router = express.Router();
const fs = require("fs")
const fse = require("fs-extra")

// get book module
var Media = require('../models/media');

// // Get category module
// var Category = require("../models/category")

// Get all medias
router.get("/", function(req, res){
    
      Media.find(function(err, medias){
        if (err) {
            console.log(err);
        }

        res.render("all_medias", {
            title: "All Medias",
            medias: medias
        })
    });

});

// // Get books by category
// router.get("/:category", function(req, res){

//     var catSlug = req.params.category;

//     Category.findOne({slug: catSlug}, function(err, cat){

//         Book.find({category: catSlug}, function(err, books){
//             if (err) {
//                 console.log(err);
//             }

//             // apps.locals.extFunction = function (file) {
//             //     var bookExt = (path.extname(file)).toLowerCase();

//             //     return bookExt;
//             // }


//             res.render("cat_books", {
//                 // title: cat.title,
//                 books: books,
//             });

//         });

//     })
    
    

// });


// Get single media details
router.get("/:media", function(req, res){


    Media.findOne({slug: req.params.media},  function(err, media){
        if(err){
            console.log(err);
        } else  {
            res.render("media", {
                title: media.title,
                p: media,
                // bookFile: book.file;
            });
        }
    })

})



// Exports
module.exports = router;
