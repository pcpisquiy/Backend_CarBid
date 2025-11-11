const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/sequelize');

class Brand extends Model {}

Brand.init({
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Descripcion: { type: DataTypes.STRING(100), allowNull: false },
  Activo: { type: DataTypes.BOOLEAN, defaultValue: true },
}, {
  sequelize,
  modelName: 'Brand',
  tableName: 'tbl_Marca',
  timestamps: false,
});

module.exports = Brand;
