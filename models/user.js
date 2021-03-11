const mongoose = require("mongoose");

// User Schema
const UserSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  admin: {
    type: Number,
  },
  forgot_password_key: {
    type: Number,
  },
});

var User = (module.exports = mongoose.model("User", UserSchema));
