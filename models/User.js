const { sequelize } = require("../config/dbConnection");
const { DataTypes } = require("sequelize");

const User = sequelize.define("User", {
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: DataTypes.STRING,
    validate: {
      len: [6, 128],
    },
  },
  name: {
    type: DataTypes.STRING,
  },
});
// sequelize.sync(); //help migrate to the db
module.exports = User;
