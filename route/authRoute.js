const express = require("express");
const { body } = require("express-validator");
const {
  getRegister,
  postRegister,
  getLogin,
  postLogin,
  logout,
} = require("../controllers/AuthController");
const authRouter = express.Router();

//login get
authRouter.get("/login", getLogin);

//login post
authRouter.post(
  "/",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
  ],
  postLogin
);

//register get
authRouter.get("/register", getRegister);

//register post
authRouter.post(
  "/register",
  [
    body("name")
      .isLength({ min: 3 })
      .withMessage("Name must be at least 3 characters")
      .trim(),
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters")
      .trim(),
  ],
  postRegister
);

//logout
authRouter.post("/logout", logout);

module.exports = authRouter;
