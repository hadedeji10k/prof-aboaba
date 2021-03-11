const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const config = require("./config/database");
const bodyParser = require("body-parser");
const session = require("express-session");
const expressValidator = require("express-validator");
const fileUpload = require("express-fileupload");
const passport = require("passport");
const auth = require("./config/auth");
const isAdmin = auth.isAdmin;

// mongodb deprecation warnings
mongoose.set("useUnifiedTopology", true);
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
// connect to db
mongoose.connect(config.database);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to DB");
});

// init app to express module
const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// set Public folders
app.use(express.static(path.join(__dirname, "public")));

// set global error variable
app.locals.errors = null;

// Get Book Model
const Book = require("./models/book");
// Get Journal Model
const Journal = require("./models/journal");
// // Get Conference Model
const Conference = require("./models/conference");
// Get Media Model
const Media = require("./models/media");
// Get Resources Model
const Resources = require("./models/resources");

// Express File-Upload middleware
app.use(fileUpload());

// body-parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Express-session middleware
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true}
  })
);

// express validator middleware
app.use(
  expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split("."),
        root = namespace.shift(),
        formParam = root;

      while (namespace.length) {
        formParam += "[" + namespace.shift() + "]";
      }
      return {
        param: formParam,
        msg: msg,
        value: value,
      };
    },
    customValidators: {
      isImage: function (value, filename) {
        var extension = path.extname(filename).toLowerCase();

        switch (extension) {
          case ".jpg":
            return ".jpg";
          case ".jpeg":
            return ".jpeg";
          case ".png":
            return ".png";
          case ".pdf":
            return ".pdf";

          default:
            return false;
        }
      },
      isFile: function (value, filename) {
        var extension = path.extname(filename).toLowerCase();

        switch (extension) {
          case ".pdf":
            return ".pdf";

          default:
            return false;
        }
      },
    },
  })
);

// Express messages middleware
app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Passport Config
require("./config/passport")(passport);

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function (req, res, next) {
  res.locals.user = req.user || null;
  next();
});

// Set routes
const users = require("./routes/users.js");
const books = require("./routes/books.js");
const journals = require("./routes/journals.js");
const conferences = require("./routes/conferences.js");
const media = require("./routes/medias.js");
const resources = require("./routes/resources.js");
const adminBooks = require("./routes/admin_books.js");
const adminJournals = require("./routes/admin_journals.js");
const adminConferences = require("./routes/admin_conferences.js");
const adminCarousel = require("./routes/admin_carousel.js");
const adminResources = require("./routes/admin_resources.js");
const adminMedias = require("./routes/admin_medias.js");
const adminAbout = require("./routes/admin_about.js");
const adminResearch = require("./routes/admin_research.js");

app.use("/users", users);
app.use("/books", books);
app.use("/journals", journals);
app.use("/conferences", conferences);
app.use("/medias", media);
app.use("/resources", resources);
app.use("/admin/books", adminBooks);
app.use("/admin/journals", adminJournals);
app.use("/admin/conferences", adminConferences);
app.use("/admin/carousel", adminCarousel);
app.use("/admin/resources", adminResources);
app.use("/admin/medias", adminMedias);
app.use("/admin/about", adminAbout);
app.use("/admin/research", adminResearch);

// Get Home Page(Index)
app.get("/", async function (req, res) {
  // define 3 query document
  const query = {};
  const sort = { _id: -1 };
  const limit = 3;
  const medias = await Media.find(query).sort(sort).limit(limit);
  const books = await Book.find(query).sort(sort).limit(limit);
  const journals = await Journal.find(query).sort(sort).limit(limit);
  const conferences = await Conference.find(query).sort(sort).limit(limit);
  const resources = await Resources.find(query).sort(sort).limit(limit);

  res.render("index", {
    medias: medias,
    books: books,
    resources: resources,
    journals: journals,
    conferences: conferences,
  });
});

// Get Admin Page (Admin_index)
app.get("/admin", isAdmin, function (req, res) {
  res.render("../admin/admin_index");
});

// Get Admin Publication route
app.get("/admin/publications", isAdmin, function (req, res) {
  res.render("../admin/admin_publications");
});

// Get Admin Other Settings route
app.get("/admin/other", isAdmin, function (req, res) {
  res.render("../admin/other");
});

// research page
// get researches module
var Research = require("./models/research");
// Get Research interest page
app.get("/research", function (req, res) {
  Research.find(function (err, researches) {
    if (err) console.log(err);
    res.render("research_interest", {
      researches: researches,
    });
  });
});

// About Page
// get About module
var About = require("./models/about");

// Get About me page
app.get("/about", function (req, res) {
  About.find(function (err, abouts) {
    if (err) console.log(err);
    res.render("about", {
      abouts: abouts,
    });
  });
});

// Get search page
app.get("/search", function (req, res) {
  res.render("search_page");
});

// Post search button
app.post("/search", async function (req, res) {
  const search = req.body.search;

  let slug;

  if (search == "") {
    slug = "09876543wedfgbnP-0--112bvcdert6yujmn=--bvcfrtyuijm/.'1vfgtyujm,";
  } else {
    slug = search.replace(/\s+/g, "-").toLowerCase();
  }
  const query = { slug: { $regex: slug } };

  const books = await Book.find(query);
  const resources = await Resources.find(query);
  const medias = await Media.find(query);
  const conferences = await Conference.find(query);
  const journals = await Journal.find(query);

  res.render("search", {
    books: books,
    resources: resources,
    medias: medias,
    search: search,
    journals: journals,
    conferences: conferences,
  });
});

// start the server
app.listen(process.env.PORT || 5000, function () {
  console.log("Server is running at port 5000");
});
