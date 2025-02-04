const { sequelize } = require("../config/dbConnection");

// Import models
const User = require("./User");
const Post = require("./Post");
const Like = require("./Like");

// Define relationships
User.hasMany(Post, {
  foreignKey: "userId",
  as: "posts",
});
Post.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

User.hasMany(Like, {
  foreignKey: "userId",
  as: "likes",
});

Post.hasMany(Like, {
  foreignKey: "postId",
  as: "likes",
});

// sequelize
//   .sync({ alter: true })
//   .then(() => {
//     console.log("Database & tables synced!");
//   })
//   .catch((err) => {
//     console.error("Error syncing database:", err);
//   });

// Export models after associations are defined
module.exports = {
  User,
  Post,
  Like,
};
