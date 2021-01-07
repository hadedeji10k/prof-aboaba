const mongoose = require('mongoose');

// book Schema
const BookSchema = mongoose.Schema({
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
    image: {
        type: String
    },
    file: {
        type: String
    },
    date: {
        type: String
    }
});

var Book = module.exports = mongoose.model('Book', BookSchema);