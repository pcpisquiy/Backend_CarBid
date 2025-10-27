const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/sequelize');

class Bid extends Model {}

Bid.init(
  {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Publicacion: { type: DataTypes.INTEGER, allowNull: false },
    Valor_a_Pujar: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    Fecha_Grabacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    Usuario_Grabacion: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,                      // ⬅️ IMPORTANTE
    modelName: 'Bid',
    tableName: 'tbl_Puja',
    timestamps: false,
  }
);

module.exports = Bid;
