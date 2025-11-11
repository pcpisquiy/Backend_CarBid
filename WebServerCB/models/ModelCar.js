const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/sequelize');
const Brand = require('./Brand');

class ModelCar extends Model {}

ModelCar.init({
  Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  Id_Marca: { type: DataTypes.INTEGER, allowNull: false },
  Descripcion: { type: DataTypes.STRING(120), allowNull: false }, // modelo
  Activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  Anio: { type: DataTypes.SMALLINT, allowNull: true },
}, {
  sequelize,
  modelName: 'ModelCar',
  tableName: 'tbl_Modelo',
  timestamps: false,
});

//ModelCar.belongsTo(Brand, { as: 'Marca', foreignKey: 'Id_Marca' });
//Brand.hasMany(ModelCar, { as: 'Modelos', foreignKey: 'Id_Marca' });

module.exports = ModelCar;
