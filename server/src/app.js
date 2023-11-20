const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");
const helmet = require("helmet");
const compression = require("compression");

const multerCnfg = require("../../util/multer-conf.js");
require("dotenv").config({ path: path.join(__dirname, "/.env") }); //load .env variables

const app = express();

const csrfProtection = csrf();

const tasks = new MongoDBStore({
  uri: process.env.MONGODB_URI,
  session: "mySessions",
});

app.set("view engine", "ejs"); //EJS

app.use(express.static(path.join(__dirname, "..", "..", "public"))); //static folder route
app.use(
  "/uploads",
  express.static(path.join(__dirname, "..", "..", "uploads"))
);

// setting up a session
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    tasks: tasks,
  })
);

app.use(helmet());
app.use(compression());
app.use(flash()); //flashing message
app.use(bodyParser.urlencoded({ extended: false })); //Body-Parser
app.use(
  multer({
    storage: multerCnfg.fileStorage,
    fileFilter: multerCnfg.imageFilter,
  }).single("image")
); // to parse files such as images
app.use(csrfProtection); //csrf middleware

//local variables to share with all controllers in the routes below.
app.use((req, res, next) => {
  var token = req.csrfToken();
  res.locals.isAuth = req.session.isLoggedin; //True after logging in
  res.locals.csrfToken = token;
  next();
});

// Routes
const userData = require("../routes/user.js");
const listRoute = require("../routes/list.js");
const adminData = require("../routes/admin.js");
const errorController = require("../../controllers/errorController");

//Middleares
app.use(express.static(path.join(__dirname, "node_modules/bootstrap/dist/"))); //bootstrap
app.use(userData);
app.use(listRoute);
app.use(adminData);

//Error handling
app.use(errorController.error404); //404 page

// Wait for database to connect, logging an error if there is a problem
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Mongoose connect: Connected");
    app.listen(process.env.PORT);
    console.log("Listening to port 3000");
  })
  .catch();
