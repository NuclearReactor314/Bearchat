const { Server } = require('socket.io');

let io;

exports.handler = async function (event, context) {
  if (!io) {
    io = new Server({ cors: { origin: '*' } });
    io.on('connection', (socket) => {
      socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
      });
      socket.on('edit message', (msg) => {
        io.emit('edit message', msg);
      });
      socket.on('delete message', (id) => {
        io.emit('delete message', id);
      });
    });
  }
  return {
    statusCode: 200,
    body: 'WebSocket server ready',
  };
};