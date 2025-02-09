const asyncHandler = require("express-async-handler");
const { sequelize } = require("../config/dbConnection");
const { validationResult } = require("express-validator");
const { Post, User, Like } = require("../models");
const { json } = require("body-parser");

const fetchPostIndex = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1; // Current page from query params
  const limit = 5; // Number of posts per page
  const offset = (page - 1) * limit;

  // Get total number of posts
  const totalPosts = await Post.count();
  const totalPages = Math.ceil(totalPosts / limit);

  // Validate page number
  const currentPage = Math.min(Math.max(page, 1), totalPages);

  const currentUserId = req.session.user?.id || 0;

  const posts = await Post.findAll({
    attributes: {
      include: [
        [sequelize.fn("COUNT", sequelize.col("likes.id")), "likesCount"],

        [
          sequelize.literal(`(
        SELECT EXISTS (
          SELECT 1 FROM likes 
          WHERE likes.postId = Post.id 
          AND likes.userId = :currentUserId
        )
      )`),
          "hasLiked",
        ],
      ],
    },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "email"],
      },
      {
        model: Like,
        as: "likes",
        attributes: [],
      },
    ],
    group: ["Post.id"],
    order: [["id", "DESC"]],
    limit: limit,
    offset: offset,
    subQuery: false,
    replacements: { currentUserId },
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
  const imageFile = req.file;

  // check if contains file or not
  const imagePath = imageFile ? imageFile.path : null;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg });
  }

  try {
    const post = await Post.create({
      content: content,
      image: imagePath,
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

    return res.status(200).json({
      message: "Post created successfully",
      post: postWithUser,
    });
  } catch (error) {
    console.log(error);
  }
});

const editPost = asyncHandler(async (req, res, next) => {
  // const { postId, content } = req.body;
  const postId = req.body.id;
  const content = req.body.content;

  const imageFile = req.file;
  // check if contains file or not

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
    //if image exist then update exist ignore
    if (imageFile) {
      post.image = imageFile.path;
    }
    const updatedPost = await post.save();

    return res
      .status(200)
      .json({ message: "Post updated successfully", post: updatedPost });
  } catch (error) {
    console.log(error);
  }
});

const likePost = asyncHandler(async (req, res, next) => {
  const postId = req.body.post_id;

  //check if post exist and user like if
  const post = await Post.findOne({
    where: { id: postId },
  });
  if (!post) {
    return res.status(404).json({ errors: "post does not exist" });
  }

  //check if user has like post
  const userLike = await Like.findOne({
    where: {
      postId: postId,
      userId: req.session.user.id,
    },
  });

  try {
    if (userLike) {
      await userLike.destroy();
      return res.status(200).json({ message: "Post unliked" });
    } else {
      await Like.create({ postId, userId: req.session.user.id });
      return res.status(200).json({ message: "Post liked" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const deletePost = asyncHandler(async (req, res, next) => {
  const id = req.body.post_id;

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

    res.status(200).json({
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
  likePost,
};
