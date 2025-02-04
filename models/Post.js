const { sequelize } = require("../config/dbConnection");
const { DataTypes } = require("sequelize");

const Post = sequelize.define(
  "Post",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    tableName: "posts",
    timestamps: true,
  }
);

module.exports = Post;
