// sockets/auctionSocket.js
const svc = require('../services/bidService');
const Auction = require('../models/Auction');

function wireAuctionSockets(io) {
  // Cada cliente se une a la sala de su subasta con: socket.emit('auction:join', { auctionId })
  io.on('connection', (socket) => {
    // unir a room
    socket.on('auction:join', async ({ auctionId }) => {
      if (!auctionId) return;
      const room = `auction_${auctionId}`;
      socket.join(room);

      // enviar estado inicial (detalle + bids)
      try {
        const [detail, bids] = await Promise.all([
          svc.getAuctionDetail(auctionId),
          svc.getBids(auctionId, 200)
        ]);
        socket.emit('auction:init', { detail, bids });
      } catch (e) {
        console.error(e);
      }
    });

    socket.on('disconnect', () => {
      // nada especial; rooms se limpian solos
    });
  });
}

/**
 * Programa notificaciones de cierre por tiempo.
 * Llama una vez en el arranque para subastas ya existentes.
 */
async function scheduleClosingTimers(io) {
  const now = new Date();

  // Trae subastas que aún no han pasado su Fecha_Fin
  const Op = require('sequelize').Op;
  const list = await Auction.findAll({
    where: { Fecha_Fin: { [Op.gte]: now } },
    attributes: ['Id','Fecha_Fin']
  });

  list.forEach(a => {
    const endMs = new Date(a.Fecha_Fin).getTime();
    const delay = Math.max(0, endMs - Date.now());
    setTimeout(async () => {
      const winner = await svc.getWinner(a.Id);
      io.to(`auction_${a.Id}`).emit('auction:ended', { auctionId: a.Id, winner });
      // opcional: cerrar la sala “virtualmente” (el front dejará de escuchar)
      // (socket.io no requiere "cerrar" la sala; basta con que el front deje de enviar/escuchar)
    }, delay);
  });
}

module.exports = { wireAuctionSockets, scheduleClosingTimers };
