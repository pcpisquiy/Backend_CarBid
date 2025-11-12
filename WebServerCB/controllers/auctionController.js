// controllers/auctionController.js
const { Op } = require('sequelize');
const { Auction, Photo, ModelCar, Brand, Transmission, State, User } = require('../models');

function toNumber(x) {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

// Permite Id (1/2/3) o descripción "Automática"/"Manual"/"CVT"
async function resolveTransmissionId(input) {
  if (input === undefined || input === null || input === '') return null;
  const n = toNumber(input);
  if (n && n > 0) return n;
  const row = await Transmission.findOne({
    where: { Descripcion: { [Op.like]: String(input).trim() } },
    attributes: ['Id']
  });
  return row ? row.Id : null;
}

exports.createAuction = async (req, res) => {
  try {
    const body = req.body || {};

    const Titulo = (body.Titulo ?? body.titulo ?? '').toString().trim();
    const Id_Modelo_raw = body.Id_Modelo ?? body.id_modelo ?? body.idModelo;
    const Id_Transmision_raw = body.Id_Transmision ?? body.id_transmision ?? body.trans ?? body.Transmision;
    const Precio_Inicial_raw = body.Precio_Inicial ?? body.precio_inicial ?? body.precio ?? body.base;

    const Kilometraje = toNumber(body.Kilometraje ?? body.km) ?? 0;
    const Id_Modelo = toNumber(Id_Modelo_raw);
    const Id_Transmision = await resolveTransmissionId(Id_Transmision_raw);
    const Precio_Inicial = toNumber(Precio_Inicial_raw);

    const Fecha_Inicio = body.Fecha_Inicio ?? body.fecha_inicio ?? body.startAt;
    const Fecha_Fin = body.Fecha_Fin ?? body.fecha_fin ?? body.endAt;
    const fechaInicio = Fecha_Inicio ? new Date(Fecha_Inicio) : new Date();
    const fechaFin = Fecha_Fin ? new Date(Fecha_Fin) : new Date(Date.now() + 7*24*60*60*1000);

    const Id_Estado = toNumber(body.Id_Estado) ?? 1;
    const Usuario_Grabacion = toNumber(body.Usuario_Grabacion) ?? 1;
    const Fotos = Array.isArray(body.Fotos) ? body.Fotos : [];

    if (!Titulo || !Id_Modelo || !Id_Transmision || !Precio_Inicial) {
      return res.status(400).json({
        error: 'Campos requeridos: Titulo, Id_Modelo, Id_Transmision, Precio_Inicial',
        recibido: { Titulo, Id_Modelo: Id_Modelo_raw, Id_Transmision: Id_Transmision_raw, Precio_Inicial: Precio_Inicial_raw }
      });
    }

    const nueva = await Auction.create({
      Titulo,
      Id_Modelo,
      Kilometraje,
      Id_Transmision,
      Precio_Inicial,
      Fecha_Inicio: fechaInicio,
      Fecha_Fin: fechaFin,
      Id_Estado,
      Usuario_Grabacion
    });

    // Guardar imágenes en tbl_Imagen (Photo model)
    const fotosSubidas = Array.isArray(req.files)
      ? req.files.map((f, i) => ({
          Id_Publicacion: nueva.Id,
          Url: `/uploads/${f.filename}`,
          Orden: i
        }))
      : [];

    const fotosBody = Array.isArray(Fotos)
      ? Fotos.filter(Boolean).map((url, i) => ({
          Id_Publicacion: nueva.Id,
          Url: String(url),
          Orden: fotosSubidas.length + i
        }))
      : [];

    const payloadFotos = [...fotosSubidas, ...fotosBody];
    if (payloadFotos.length) {
      await Photo.bulkCreate(payloadFotos);
    }

    return res.status(201).json({ id: nueva.Id });
  } catch (e) {
    console.error('createAuction error:', e);
    res.status(500).json({ error: 'No se pudo crear la publicación' });
  }
};

exports.getAuctionById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: 'Id inválido' });

    const row = await Auction.findByPk(id, {
      attributes: ['Id','Titulo','Id_Modelo','Kilometraje','Id_Transmision','Precio_Inicial','Fecha_Inicio','Fecha_Fin','Id_Estado','Usuario_Grabacion'],
      include: [
        { model: ModelCar, as: 'Modelo', attributes: ['Id','Descripcion','Anio','Id_Marca'],
          include: [{ model: Brand, as: 'Marca', attributes: ['Id','Descripcion'] }] },
        { model: Transmission, as: 'Transmision', attributes: ['Id','Descripcion'] },
        { model: State, as: 'Estado', attributes: ['Id','Descripcion'] },
        { model: Photo, as: 'Fotos', attributes: ['Id','Url','Orden'], separate: true, order: [['Orden','ASC']] },
        { model: User, as: 'Usuario', attributes: ['Id_Usuario','Usuario','Correo'] }
      ]
    });

    if (!row) return res.status(404).json({ error: 'No existe la publicación' });
    res.json(row);
  } catch (e) {
    console.error('getAuctionById error:', e);
    res.status(500).json({ error: 'No se pudo obtener la publicación' });
  }
};
