// services/auctionService.js
const { Op, fn, col, where } = require('sequelize');

const Auction      = require('../models/Auction');
const Bid          = require('../models/Bid');
const Photo        = require('../models/Photo');
const ModelCar     = require('../models/ModelCar');
const Brand        = require('../models/Brand');
const Transmission = require('../models/Transmission');

function getEstado(pub) {
  const now = new Date();
  const ini = new Date(pub.Fecha_Inicio);
  const fin = new Date(pub.Fecha_Fin || pub.Fecha_Inicio);
  if (now < ini) return 'programada';
  if (now > fin) return 'finalizada';
  return 'activa';
}

async function getFilters() {
  const marcas = await Brand.findAll({
    where: { Activo: true },
    attributes: ['Id','Descripcion'],
    order: [['Descripcion','ASC']],
    raw: true
  });

  const aniosRows = await ModelCar.findAll({
    where: { Activo: true },
    attributes: ['Anio'],
    raw: true
  });

  const anios = Array.from(new Set(aniosRows.map(x => x.Anio).filter(Boolean)))
    .sort((a,b)=>b-a);

  return { marcas, anios };
}

/**
 * Busca publicaciones con filtros, paginación y ordenamiento.
 * SIN SQL crudo: todo con Sequelize ORM.
 */
async function searchAuctions(params) {
  const {
    q = '', marcaId = '', anio = '', min = '', max = '',
    estado = '', orden = 'cierre', page = 1, pageSize = 8
  } = params;

  const pageN = Math.max(1, parseInt(page, 10) || 1);
  const size  = Math.max(1, Math.min(48, parseInt(pageSize, 10) || 8));
  const offset = (pageN - 1) * size;

  // Filtro por fechas según estado
  const now = new Date();
  const wherePub = {};
  if (estado === 'activa') {
    wherePub.Fecha_Inicio = { [Op.lte]: now };
    wherePub.Fecha_Fin    = { [Op.gte]: now };
  } else if (estado === 'programada') {
    wherePub.Fecha_Inicio = { [Op.gt]: now };
  } else if (estado === 'finalizada') {
    wherePub.Fecha_Fin = { [Op.lt]: now };
  }

  // Include: Modelo -> Marca, Transmisión, Fotos, Pujas (para MAX)
  const incModel = {
    model: ModelCar, as: 'Modelo', required: true,
    attributes: ['Id','Descripcion','Anio','Id_Marca'],
    include: [{ model: Brand, as: 'Marca', required: true, attributes: ['Id','Descripcion'] }]
  };

  // Filtros sobre el modelo/marca y búsqueda libre
  const modelWhere = {};
  if (marcaId) modelWhere.Id_Marca = Number(marcaId);
  if (anio)    modelWhere.Anio     = Number(anio);

  if (q.trim()) {
    const term = q.trim();
    incModel.where = {
      ...modelWhere,
      [Op.or]: [
        { Descripcion: { [Op.substring]: term } }, // modelo
        { Anio: Number(term) || -1 }
      ]
    };
    // marca por term
    incModel.include[0].where = { Descripcion: { [Op.substring]: term } };
    // y título por term
    wherePub.Titulo = { [Op.substring]: term };
  } else if (Object.keys(modelWhere).length) {
    incModel.where = modelWhere;
  }

  const includes = [
    incModel,
    { model: Transmission, as: 'Trans', required: false, attributes: ['Id','Descripcion'] },
    { model: Photo, as: 'Fotos', required: false, attributes: ['Url','Orden'] },
    // No queremos las filas de pujas, solo usar MAX en agregados
    { model: Bid, as: 'Pujas', required: false, attributes: [] }
  ];

  // MAX(Valor_a_Pujar) como HighestBid — usando funciones de Sequelize
  const highestBidAgg = fn('MAX', col('Pujas.Valor_a_Pujar'));
  const highestBidCoalesce = fn('COALESCE', highestBidAgg, 0);

  // HAVING sobre el "top" (GREATEST(highest, Precio_Inicial)) con fn seguro
  const having = [];
  if (min) {
    having.push(where(fn('GREATEST', highestBidCoalesce, col('Auction.Precio_Inicial')), { [Op.gte]: Number(min) }));
  }
  if (max) {
    having.push(where(fn('GREATEST', highestBidCoalesce, col('Auction.Precio_Inicial')), { [Op.lte]: Number(max) }));
  }

  // Orden
  let order = [['Fecha_Fin','ASC']];           // cierre
  if (orden === 'puja')     order = [[highestBidAgg, 'DESC']];
  if (orden === 'reciente') order = [['Fecha_Inicio','DESC']];

  // Query con GROUP BY (para usar MAX) y sin raw SQL
  const result = await Auction.findAndCountAll({
    where: wherePub,
    include: includes,
    attributes: {
      include: [[highestBidAgg, 'HighestBid']]
    },
    group: ['Auction.Id'],
    having: having.length ? { [Op.and]: having } : undefined,
    order,
    offset,
    limit: size,
    distinct: true,     // asegura count correcto con include
    subQuery: false
  });

  // Sequelize con group devuelve count como array; normalizamos
  const total = Array.isArray(result.count) ? result.count.length : result.count;
  const rows = result.rows;

  // Map a lo que consume el front
  const items = rows.map(r => {
    const fotos = (r.Fotos || [])
      .sort((a,b) => (a.Orden||0)-(b.Orden||0))
      .map(f => f.Url);

    const highest = Number(r.get('HighestBid') || 0);
    const priceBase = Number(r.Precio_Inicial || 0);
    const priceTop  = Math.max(highest, priceBase);

    return {
      id: r.Id,
      titulo: r.Titulo,
      marca: r.Modelo?.Marca?.Descripcion || '',
      modelo: r.Modelo?.Descripcion || '',
      anio: r.Modelo?.Anio || null,
      km: r.Kilometraje || 0,
      transmision: r.Trans?.Descripcion || '',
      startAt: new Date(r.Fecha_Inicio).getTime(),
      endAt: new Date(r.Fecha_Fin || r.Fecha_Inicio).getTime(),
      estado: getEstado(r),
      priceBase,
      priceTop,
      images: fotos
    };
  });

  return {
    page: pageN,
    pageSize: size,
    total,
    pages: Math.max(1, Math.ceil(total / size)),
    items
  };
}

async function getBidsByAuctionIds(ids = []) {
  if (!ids.length) return [];
  const rows = await Bid.findAll({
    where: { Id_Publicacion: { [Op.in]: ids } },
    attributes: ['Id','Id_Publicacion','Valor_a_Pujar','Fecha_Grabacion','Usuario_Grabacion'],
    order: [['Fecha_Grabacion','ASC']],
    raw: true
  });

  return rows.map(r => ({
    id: r.Id,
    auction_id: r.Id_Publicacion,
    amount: Number(r.Valor_a_Pujar),
    created_at: new Date(r.Fecha_Grabacion).getTime(),
    user_id: r.Usuario_Grabacion
  }));
}

module.exports = {
  getFilters,
  searchAuctions,
  getBidsByAuctionIds,
};
