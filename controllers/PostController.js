const asyncHandler = require("express-async-handler");
const { validateFields } = require("./../util/helpers");
const { validationResult } = require("express-validator");
const { Post, User } = require("../models");

const fetchPostIndex = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Current page from query params
  const limit = 5; // Number of posts per page
  const offset = (page - 1) * limit;

  // Get total number of posts
  const totalPosts = await Post.count();
  const totalPages = Math.ceil(totalPosts / limit);

  // Validate page number
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const posts = await Post.findAll({
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
    ],
    order: [["id", "DESC"]],
    limit: limit,
    offset: offset,
  });

  res.render("post/index", {
    title: "Home Page",
    pageTitle: "Post",
    path: "/index",
    posts: posts,
    pagination: {
      currentPage: currentPage,
      totalPages: totalPages,
      hasNext: currentPage < totalPages,
      hasPrevious: currentPage > 1,
    },
  });
});

const createPost = asyncHandler(async (req, res, next) => {
  const content = req.body.content;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }

  try {
    const post = await Post.create({
      content: content,
      userId: req.session.user.id,
    });
    // Fetch the post with the associated user
    const postWithUser = await Post.findOne({
      where: { id: post.id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "email"], // Select only specific user attributes
        },
      ],
    });

    return res.status(201).json({
      message: "Post created successfully",
      post: postWithUser,
    });
  } catch (error) {
    console.log(error);
  }
});

const editPost = asyncHandler(async (req, res, next) => {
  // const { postId, content } = req.body;
  const postId = req.params.id;
  const content = req.body.content;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }
  try {
    const post = await Post.findOne({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if post belongs to the user
    if (post.userId !== req.session.user.id) {
      return res
        .status(403)
        .json({ error: "Unauthorized to delete this post" });
    }

    post.content = content;
    await post.save();

    return res.status(201).json({ message: "Post updated successfully" });
  } catch (error) {
    console.log(error);
  }
});

const deletePost = asyncHandler(async (req, res, next) => {
  const id = req.params.id;

  //check if post exist
  const post = await Post.findByPk(id);
  if (!post) {
    return res.status(404).json({ errors: "post does not exist" });
  }

  // Check if post belongs to the user
  if (post.userId !== req.session.user.id) {
    return res.status(403).json({ error: "Unauthorized to delete this post" });
  }

  try {
    await post.destroy();

    res.status(201).json({
      message: "Post deleted successfully",
      deletedPostId: id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error while deleting post" });
  }
});

module.exports = {
  fetchPostIndex,
  createPost,
  deletePost,
  editPost,
};
