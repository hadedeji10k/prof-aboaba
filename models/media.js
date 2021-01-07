const mongoose = require('mongoose');

// Media Schema
const MediaSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    slug: {
        type: String
    },
    desc: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    site: {
        type: String
    },
    date: {
        type: String
    }
});

var Media = module.exports = mongoose.model('Media', MediaSchema);