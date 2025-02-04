const express = require("express");
const { body } = require("express-validator");
const {
  fetchPostIndex,
  createPost,
  editPost,
  deletePost,
} = require("../controllers/PostController");
const isAuthenticated = require("../middleware/isAuthenticated");

const postRoute = express.Router();

postRoute.get("/", fetchPostIndex);

postRoute.post(
  "/create",
  [
    body("content")
      .isLength({ min: 3 })
      .withMessage("The content is required")
      .trim(),
  ],
  isAuthenticated,
  createPost
);

postRoute.post("/update/:id", isAuthenticated, editPost);
postRoute.get("/delete/:id", isAuthenticated, deletePost);

module.exports = postRoute;
