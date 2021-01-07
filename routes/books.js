const express = require("express");
const router = express.Router();
const fs = require("fs")
const fse = require("fs-extra")

// get book module
var Book = require('../models/book');

// // Get category module
// var Category = require("../models/category")

// Get all book
router.get("/", function(req, res){
    
      Book.find(function(err, books){
        if (err) {
            console.log(err);
        }

        res.render("all_books", {
            title: "All Books",
            books: books
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


// Get single book details
router.get("/:book", function(req, res){

    var galleryImages  = null;

    Book.findOne({slug: req.params.book},  function(err, book){
        if(err){
            console.log(err);
        } else  {
            var galleryDir =  "public/book_images/" + book._id + "/gallery";
            
            fs.readdir(galleryDir , function(err, files){
                if (err){
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render("book", {
                        title: book.title,
                        p: book,
                        // bookFile: book.file;
                        galleryImages: galleryImages
                    })
                }
            })
        }
    })

})



// Exports
module.exports = router;
