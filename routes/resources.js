const express = require("express");
const router = express.Router();
const fs = require("fs")
const fse = require("fs-extra")

// get resources module
var Resources = require('../models/resources');


// Get all resources
router.get("/", function(req, res){
    
      Resources.find(function(err, resources){
        if (err) {
            console.log(err);
        }

        res.render("all_resources", {
            title: "All Resources",
            resources: resources
        })
    });

});

// Get single resources details
router.get("/:resources", function(req, res){


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
