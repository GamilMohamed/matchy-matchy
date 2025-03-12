/**
 * Socket.IO event handlers for chat functionality
 */
const Message = require("../models/message");
const pool = require("../config/database");

module.exports = (io) => {
  // Keep track of active users by username
  const activeUsers = {};

  io.on("connection", (socket) => {
    activeUsers[socket.id] = socket.id;
    const length = Object.keys(activeUsers).length;

    io.emit("message", `User ${socket.id.substring(0, 5)} connected (${length} active users)`);

    socket.on("message", (data) => {
      socket.broadcast.emit("message", `User ${socket.id.substring(0, 5)}: ${data}`);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      delete activeUsers[socket.id];
      console.log(`Client disconnected: ${socket.id}`);
      io.emit("message", `User ${socket.id.substring(0, 5)} disconnected`);
    });
  });
};
