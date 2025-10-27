// // app.js

var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');

require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

const sequelize = require('./db/sequelize'); // ⬅️ instancia

// 1) Cargar modelos (esto ejecuta los .init de cada uno)
const User    = require('./models/User');
const Auction = require('./models/Auction');
const Bid     = require('./models/Bid');
const Photo   = require('./models/Photo'); // si aplica

// 2) Definir asociaciones (hazlo en un solo lugar para evitar ciclos)
Auction.belongsTo(User,   { as: 'Usuario', foreignKey: 'Usuario_Grabacion' });
User.hasMany(Auction,     { as: 'Publicaciones', foreignKey: 'Usuario_Grabacion' });

Auction.hasMany(Bid,      { as: 'Pujas', foreignKey: 'Id_Publicacion' });
Bid.belongsTo(Auction,    { as: 'Publicacion', foreignKey: 'Id_Publicacion' });

if (Photo) {
  Auction.hasMany(Photo,  { as: 'Fotos', foreignKey: 'Id_Publicacion' });
  Photo.belongsTo(Auction,{ as: 'Publicacion', foreignKey: 'Id_Publicacion' });
}

// ====== DB Init ======
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // en prod: migraciones
    console.log('DB OK');
  } catch (e) {
    console.error('DB error:', e);
  }
})();

// ====== Views & middlewares ======
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, process.env.UPLOAD_DIR || 'uploads')));

// ====== Rutas ======
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));
app.use('/api/auctions', require('./routes/auctions')); // tu ruta de publicación

app.use('/', indexRouter);
app.use('/login', loginRouter);


// ====== 404 & error handler ======
app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
