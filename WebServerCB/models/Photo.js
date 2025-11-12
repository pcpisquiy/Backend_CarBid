const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/sequelize');

class Photo extends Model {}

Photo.init(
  {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Publicacion: { type: DataTypes.INTEGER, allowNull: false },
    Imagen: { type: DataTypes.BLOB('long'), allowNull: true },   // opcional, por si guardas binario
    Url: { type: DataTypes.STRING, allowNull: true },            // ruta '/uploads/archivo.jpg'
    Orden: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  {
    sequelize,
    modelName: 'Photo',
    tableName: 'tbl_Imagen',   // ✅ tabla real
    timestamps: false,
  }
);

module.exports = Photo;
