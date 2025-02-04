const { Sequelize } = require("sequelize");
const dotenv = require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_DATABASE, // database name
  process.env.DB_USERNAME, // username
  process.env.DB_PASSWORD, // password
  {
    dialect: process.env.DB_CONNECTION,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
  }
);

const connectToDb = async () => {
  try {
    await sequelize.authenticate();
    console.log("connection successful");
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  connectToDb,
  sequelize,
};
