// models/index.js
const sequelize = require('../db/sequelize');

const User = require('./User');
const Brand = require('./Brand');
const ModelCar = require('./ModelCar');
const Transmission = require('./Transmission');
const State = require('./State');
const Auction = require('./Auction');
const Photo = require('./Photo');
const Bid = require('./Bid');

ModelCar.belongsTo(Brand, { as: 'Marca', foreignKey: 'Id_Marca' });
Brand.hasMany(ModelCar, { as: 'Modelos', foreignKey: 'Id_Marca' });

Auction.belongsTo(ModelCar, { as: 'Modelo', foreignKey: 'Id_Modelo' });
Auction.belongsTo(Transmission, { as: 'Transmision', foreignKey: 'Id_Transmision' });
Auction.belongsTo(State, { as: 'Estado', foreignKey: 'Id_Estado' });
Auction.belongsTo(User, { as: 'Usuario', foreignKey: 'Usuario_Grabacion' });

Auction.hasMany(Photo, { as: 'Fotos', foreignKey: 'Id_Publicacion' });
Auction.hasMany(Bid,   { as: 'Pujas',  foreignKey: 'Id_Publicacion' });

Photo.belongsTo(Auction, { as: 'Publicacion', foreignKey: 'Id_Publicacion' });
Bid.belongsTo(Auction,   { as: 'Publicacion', foreignKey: 'Id_Publicacion' });

module.exports = { sequelize, User, Brand, ModelCar, Transmission, State, Auction, Photo, Bid };
