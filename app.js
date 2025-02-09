const path = require("path");
const express = require("express");
const session = require("express-session");
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const csrf = require("csurf");
const flash = require("connect-flash");
const dotenv = require("dotenv").config();
const { sequelize } = require("./config/dbConnection");
const multer = require("multer");

const authRoute = require("./route/authRoute");
const postRoute = require("./route/postRoute");

const bodyParser = require("body-parser");
const app = express();
const port = process.env.PORT || 5000;

const csrfProtection = csrf();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the folder where files will be stored
    cb(null, "images/");
  },
  filename: function (req, file, cb) {
    // Generate a unique filename to avoid overwriting
    cb(null, Date.now() + path.extname(file.originalname)); // e.g., 1678945678901.jpg
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views"); //where to find the template

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: storage, fileFilter: fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(express.json());

const sessionStore = new SequelizeStore({
  db: sequelize,
  tableName: "sessions",
  checkExpirationInterval: 15 * 60 * 1000, // Clear expired sessions every 15 mins
  expiration: 24 * 60 * 60 * 1000, // Sessions expire in 24 hours
});

app.use(
  session({
    secret: "123456",
    store: sessionStore,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Cookie expiration (24 hours)
      secure: false, // Use secure cookies in production
      httpOnly: true,
    },
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.isAuthenticated = req.session.isLoggedIn;
  // res.locals.messages = req.flash();
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use(authRoute);

app.use(postRoute);

sequelize
  .sync()
  .then(() => {
    app.listen(port, async () => {
      // await connectToDb();
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => console.error("Error syncing database:", err));
