const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/sequelize');

class Photo extends Model {}

Photo.init(
  {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Publicacion: { type: DataTypes.INTEGER, allowNull: false },
    Url: { type: DataTypes.STRING, allowNull: false },
    Orden: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,                      // ⬅️ IMPORTANTE
    modelName: 'Photo',
    tableName: 'tbl_Photo',         // usa el nombre real de tu tabla
    timestamps: false,
  }
);

module.exports = Photo;
