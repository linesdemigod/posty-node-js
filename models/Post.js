const { sequelize } = require("../config/dbConnection");
const { DataTypes } = require("sequelize");

const Post = sequelize.define(
  "Post",
  {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
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
