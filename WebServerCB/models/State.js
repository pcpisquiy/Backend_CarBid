const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/sequelize');

class State extends Model {}

State.init({
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Descripcion: { type: DataTypes.STRING(60), allowNull: false },
}, {
  sequelize,
  modelName: 'State',
  tableName: 'tbl_Estado',
  timestamps: false,
});

module.exports = State;
