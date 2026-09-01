const { DataTypes } = require("sequelize");
const sequelize = require("../util/database");

const Slot = sequelize.define("Slot", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  time: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  available: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 4,
  },
});

module.exports = Slot;
