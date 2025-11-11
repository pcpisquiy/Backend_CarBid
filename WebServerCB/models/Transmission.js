const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/sequelize');

class Transmission extends Model {}

Transmission.init({
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Descripcion: { type: DataTypes.STRING(60), allowNull: false }, // Automática/Manual/CVT
  Activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: 'Transmission',
  tableName: 'tbl_Transmision',
  timestamps: false,
});

module.exports = Transmission;
