const { createRoom } = require("./state-manager");

const rooms = {};

function initRoom(roomId) {
  if (!rooms[roomId]) {
    rooms[roomId] = createRoom();
  }
}

function getRoom(roomId) {
  return rooms[roomId];
}

module.exports = { initRoom, getRoom };
