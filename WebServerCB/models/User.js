const { DataTypes, Model } = require('sequelize');
const sequelize = require('../db/sequelize');

class User extends Model {}

User.init(
  {
    Id_Usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Usuario: { type: DataTypes.STRING, allowNull: false },
    Correo: { type: DataTypes.STRING, allowNull: false },
    Contrasena: { type: DataTypes.STRING, allowNull: false },
    Activa: { type: DataTypes.BOOLEAN, defaultValue: true },
    Fecha_Creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    sequelize,                      // ⬅️ IMPORTANTE
    modelName: 'User',
    tableName: 'tbl_Usuario',
    timestamps: false,
  }
);

module.exports = User;
