/**
 * Socket emitter - used by API routes to emit ticket updates
 * server.js sets the io instance on startup
 */
let io = null;

function setSocketIO(instance) {
  io = instance;
}

function emitTicketUpdate(authorId, ticket) {
  if (io) {
    io.to(`tickets:${authorId}`).emit("ticket:updated", ticket);
  }
}

module.exports = { setSocketIO, emitTicketUpdate };
