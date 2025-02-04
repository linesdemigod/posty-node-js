const asyncHandler = require("express-async-handler");
const bcrypt = require("bcrypt");
const { validationResult } = require("express-validator");
const User = require("../models/User");

const getRegister = asyncHandler(async (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/register", {
    title: "Register",
    pageTitle: "Register",
    path: "/",
    errorMessage: message,
    oldInput: {},
  });
});

const postRegister = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/register", {
      title: "Register",
      pageTitle: "Register",
      path: "/",
      errorMessage: errors.array()[0].msg,
      oldInput: { name, email },
    });
  }

  try {
    //insert into the table
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.redirect("/");
  } catch (error) {
    console.log(error);
    let errors = [];

    // Handle validation errors
    if (error.name === "SequelizeValidationError") {
      errors = error.errors.map((err) => err.message);
      req.flash("error", errors);
    }

    // Handle duplicate email error
    else if (error.name === "SequelizeUniqueConstraintError") {
      req.flash("error", "Email already in use");
    }

    // Handle other errors
    else {
      errors.push("An error occurred while registering the user");
      req.flash("error", "An error occurred while registering the user");
    }

    // Render the register page with errors
    res.redirect("/register");
  }
});

const getLogin = asyncHandler(async (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    title: "Login",
    pageTitle: "Login",
    path: "/",
    errorMessage: message,
    oldInput: {},
  });
});

const postLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      title: "Login",
      pageTitle: "Login",
      path: "/",
      errorMessage: errors.array()[0].msg,
      oldInput: { email },
    });
  }
  //find the user with the email
  const user = await User.findOne({ where: { email: email } });

  try {
    if (user && (await bcrypt.compare(password, user.password))) {
      req.session.isLoggedIn = true;
      req.session.user = { id: user.id, email: user.email, name: user.name };
      req.session.save((err) => {
        if (err) {
          console.error(err);
        }

        res.redirect("/");
      });
    } else {
      req.flash("error", "Invalid email or password.");
      res.redirect("/login");
    }

    // res.redirect("/");
  } catch (error) {
    console.log(error);
    let errors = [];
  }
});

const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.log(err);
    }
    res.redirect("/");
  });
};

module.exports = {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
};
