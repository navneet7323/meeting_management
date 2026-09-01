const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  "meeting_booking_db",
  "root",
  "NewPassword@123",
  {
    dialect: "mysql",
    host: "localhost",
    logging: false,
  },
);

module.exports = sequelize;
