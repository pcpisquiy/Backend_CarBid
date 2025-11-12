// services/bidService.js
const { Op } = require('sequelize');
const Auction  = require('../models/Auction');
const Bid      = require('../models/Bid');
const Photo    = require('../models/Photo');
const ModelCar = require('../models/ModelCar');
const Brand    = require('../models/Brand');
const Trans    = require('../models/Transmission');
const sequelize = require('../db/sequelize');

function isActive(auction) {
  const now = new Date();
  return new Date(auction.Fecha_Inicio) <= now && now <= new Date(auction.Fecha_Fin || auction.Fecha_Inicio);
}

async function getAuctionDetail(auctionId) {
  const a = await Auction.findByPk(auctionId, {
    include: [
      { model: Photo, as: 'Fotos', attributes: ['Url','Orden'] },
      { model: ModelCar, as: 'Modelo', attributes: ['Descripcion','Anio'], include: [{ model: Brand, as: 'Marca', attributes: ['Descripcion'] }] },
      { model: Trans, as: 'Transmision', attributes: ['Descripcion'] }
    ],
  });
  if (!a) return null;

  const highest = await Bid.max('Valor_a_Pujar', { where: { Id_Publicacion: auctionId } }) || 0;
  const priceTop = Math.max(Number(a.Precio_Inicial || 0), Number(highest || 0));

  const fotos = (a.Fotos || []).sort((x,y)=>(x.Orden||0)-(y.Orden||0)).map(f=>f.Url);

  return {
    id: a.Id,
    titulo: a.Titulo,
    marca: a.Modelo?.Marca?.Descripcion || '',
    modelo: a.Modelo?.Descripcion || '',
    anio: a.Modelo?.Anio || null,
    transmision: a.Trans?.Descripcion || '',
    km: a.Kilometraje || 0,
    startAt: new Date(a.Fecha_Inicio).getTime(),
    endAt: new Date(a.Fecha_Fin || a.Fecha_Inicio).getTime(),
    priceBase: Number(a.Precio_Inicial || 0),
    priceTop,
    images: fotos,
    isActive: isActive(a),
  };
}

async function getBids(auctionId, limit = 50) {
  const rows = await Bid.findAll({
    where: { Id_Publicacion: auctionId },
    attributes: ['Id','Id_Publicacion','Valor_a_Pujar','Fecha_Grabacion','Usuario_Grabacion'],
    order: [['Fecha_Grabacion','DESC']],
    limit,
    raw: true
  });
  return rows.map(r => ({
    id: r.Id,
    auction_id: r.Id_Publicacion,
    amount: Number(r.Valor_a_Pujar),
    created_at: new Date(r.Fecha_Grabacion).getTime(),
    user_id: r.Usuario_Grabacion,
  })).reverse(); // para devolverlas asc
}

async function placeBid({ auctionId, userId, amount }) {
  return await sequelize.transaction(async (t) => {
    // Lock de la subasta para leer estado y precio mínimo
    const a = await Auction.findByPk(auctionId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!a) throw new Error('Subasta no existe');

    const now = new Date();
    if (!(new Date(a.Fecha_Inicio) <= now && now <= new Date(a.Fecha_Fin || a.Fecha_Inicio))) {
      throw new Error('La subasta no está activa');
    }

    // Highest bid (con lock transaccional)
    const highest = await Bid.max('Valor_a_Pujar', { where: { Id_Publicacion: auctionId }, transaction: t }) || 0;
    const minAccept = Math.max(Number(a.Precio_Inicial || 0), Number(highest || 0)) + 0; // + incremento si lo deseas
    if (Number(amount) <= minAccept) {
      throw new Error(`La puja debe ser mayor a ${minAccept}`);
    }

    const newBid = await Bid.create({
      Id_Publicacion: auctionId,
      Valor_a_Pujar: Number(amount),
      Usuario_Grabacion: userId
    }, { transaction: t });

    return {
      id: newBid.Id,
      auction_id: auctionId,
      amount: Number(newBid.Valor_a_Pujar),
      created_at: new Date(newBid.Fecha_Grabacion).getTime(),
      user_id: userId
    };
  });
}

async function getWinner(auctionId) {
  const top = await Bid.findOne({
    where: { Id_Publicacion: auctionId },
    order: [['Valor_a_Pujar','DESC'], ['Fecha_Grabacion','ASC']],
    attributes: ['Id','Id_Publicacion','Valor_a_Pujar','Fecha_Grabacion','Usuario_Grabacion'],
    raw: true
  });
  if (!top) return null;
  return {
    id: top.Id,
    auction_id: top.Id_Publicacion,
    amount: Number(top.Valor_a_Pujar),
    created_at: new Date(top.Fecha_Grabacion).getTime(),
    user_id: top.Usuario_Grabacion
  };
}

module.exports = {
  getAuctionDetail,
  getBids,
  placeBid,
  getWinner,
};
