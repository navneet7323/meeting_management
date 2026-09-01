const { DataTypes } = require('sequelize');
const sequelize = require('../util/database');

const Meeting = sequelize.define('Meeting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  meetLink: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Meeting;