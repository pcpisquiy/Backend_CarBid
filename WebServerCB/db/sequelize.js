// db/sequelize.js
require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 3306,
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: false,
  }
);

/* =======================
   MODELOS
   ======================= */

const Usuario = sequelize.define(
  'Usuario',
  {
    Id_Usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Usuario: { type: DataTypes.STRING, allowNull: false },
    Correo: { type: DataTypes.STRING, allowNull: false },
    Contrasena: { type: DataTypes.STRING, allowNull: false },
    Activa: { type: DataTypes.BOOLEAN, defaultValue: true },
    Fecha_Creacion: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
  },
  { tableName: 'tbl_Usuario', timestamps: false }
);

const Publicacion = sequelize.define(
  'Publicacion',
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
  { tableName: 'tbl_Publicacion', timestamps: false }
);

const Puja = sequelize.define(
  'Puja',
  {
    Id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    Id_Publicacion: { type: DataTypes.INTEGER, allowNull: false },
    Valor_a_Pujar: { type: DataTypes.DECIMAL(12, 2), allowNull: false },
    Fecha_Grabacion: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
    Usuario_Grabacion: { type: DataTypes.INTEGER, allowNull: false },
  },
  { tableName: 'tbl_Puja', timestamps: false }
);

/* =======================
   RELACIONES
   ======================= */

// Una publicación tiene muchas pujas
Publicacion.hasMany(Puja, { as: 'Pujas', foreignKey: 'Id_Publicacion' });
Puja.belongsTo(Publicacion, { as: 'Publicacion', foreignKey: 'Id_Publicacion' });

// Un usuario registra muchas publicaciones
Usuario.hasMany(Publicacion, {
  as: 'Publicaciones',
  foreignKey: 'Usuario_Grabacion',
});
Publicacion.belongsTo(Usuario, {
  as: 'Usuario',
  foreignKey: 'Usuario_Grabacion',
});

/* =======================
   INIT HELPERS (opcional)
   ======================= */

async function initDb() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD OK');
  } catch (err) {
    console.error('❌ Error de conexión a BD:', err);
  }
}

// module.exports = {
//   sequelize,
//   Sequelize,
//   DataTypes,
//   Usuario,
//   Publicacion,
//   Puja,
//   initDb,
// };

module.exports = sequelize; // ⬅️ SOLO la instancia
