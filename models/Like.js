const { sequelize } = require("../config/dbConnection");
const { DataTypes } = require("sequelize");

const Like = sequelize.define(
  "Like",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    postId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Posts",
        key: "id",
      },
    },
  },
  {
    tableName: "likes",
    timestamps: true,
  }
);

module.exports = Like;
