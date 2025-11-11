// // app.js

var indexRouter = require('./routes/index');
const loginRouter = require('./routes/login');


require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const app = express();
app.use(cors({
  origin: '*', // todos los orígenes
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

// ✅ Responder preflight a todo
app.options('*', cors());
const sequelize = require('./db/sequelize'); // ⬅️ instancia

// 1) Cargar modelos (esto ejecuta los .init de cada uno)
const User    = require('./models/User');
const Auction = require('./models/Auction');
const Bid     = require('./models/Bid');
const Photo   = require('./models/Photo'); 
const ModelCar     = require('./models/ModelCar');
const Brand        = require('./models/Brand');
const Transmission = require('./models/Transmission');
const State        = require('./models/State');

// 2) Definir asociaciones (hazlo en un solo lugar para evitar ciclos)
Auction.belongsTo(User,         { as: 'Usuario', foreignKey: 'Usuario_Grabacion' });
Auction.belongsTo(ModelCar,     { as: 'Modelo', foreignKey: 'Id_Modelo' });
Auction.belongsTo(Transmission, { as: 'Trans',  foreignKey: 'Id_Transmision' });
Auction.belongsTo(State,        { as: 'Estado', foreignKey: 'Id_Estado' });

Auction.hasMany(Photo, { as: 'Fotos', foreignKey: 'Id_Publicacion' });
Photo.belongsTo(Auction, { as: 'Publicacion', foreignKey: 'Id_Publicacion' });

Auction.hasMany(Bid, { as: 'Pujas', foreignKey: 'Id_Publicacion' });
Bid.belongsTo(Auction, { as: 'Publicacion', foreignKey: 'Id_Publicacion' });

ModelCar.belongsTo(Brand, { as: 'Marca', foreignKey: 'Id_Marca' });
Brand.hasMany(ModelCar, { as: 'Modelos', foreignKey: 'Id_Marca' });

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
//app.use('/users', require('./routes/users'));
app.use('/api/auctions', require('./routes/auctions'));
app.use('/api/search', require('./routes/search'));
app.use('/api', require('./routes/bids'));


app.use('/', indexRouter);
app.use('/api', require('./routes/login'));          // POST /api/login


// ====== 404 & error handler ======
app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
