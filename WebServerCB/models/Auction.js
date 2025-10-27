const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/sequelize');

class Auction extends Model {}

Auction.init(
  {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Titulo: { type: DataTypes.STRING, allowNull: false },
    Id_Modelo: { type: DataTypes.INTEGER, allowNull: false },
    Kilometraje: { type: DataTypes.INTEGER, defaultValue: 0 },
    Id_Transmision: { type: DataTypes.INTEGER, allowNull: false },
    Precio_Inicial: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    Fecha_Inicio: { type: DataTypes.DATE, allowNull: false },
    Fecha_Fin: { type: DataTypes.DATE, allowNull: false },
    Id_Estado: { type: DataTypes.INTEGER, allowNull: false },
    Usuario_Grabacion: { type: DataTypes.INTEGER, allowNull: false },
  },
  {
    sequelize,                      // ⬅️ IMPORTANTE
    modelName: 'Auction',
    tableName: 'tbl_Publicacion',
    timestamps: false,
  }
);

module.exports = Auction;
