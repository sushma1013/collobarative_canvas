const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const path = require("path");
app.use(express.static(path.join(__dirname, "../client")));

const room = {
  pages: [[]],          // 👈 page 0 ALWAYS exists
  users: {},
  redoStack: {}
};

io.on("connection", socket => {

  room.users[socket.id] = {
    color: "#" + Math.floor(Math.random() * 16777215).toString(16)
  };
  room.redoStack[socket.id] = [];

  io.emit("users_update", room.users);

  // Send first page
  socket.emit("page_data", room.pages[0]);

  // Live drawing
 socket.on("drawing_step", (segment) => {

  if (
    typeof segment.page !== "number" ||
    segment.page < 0 ||
    !room.pages[segment.page]
  ) {
    segment.page = 0;
  }

  socket.broadcast.emit("stroke_draw", segment);
});

socket.on("drawing_end", (stroke) => {
  stroke.userId = socket.id;

  // 🔒 HARD SAFETY (CRITICAL)
  if (
    typeof stroke.page !== "number" ||
    stroke.page < 0
  ) {
    stroke.page = 0;
  }

  // 🔒 AUTO-CREATE PAGE IF MISSING
  if (!room.pages[stroke.page]) {
    room.pages[stroke.page] = [];
  }

  room.pages[stroke.page].push(stroke);

  // Clear redo stack on new action
  room.redoStack[socket.id] = [];
});

  // Clear page
  socket.on("clear_page", pageIndex => {
    room.pages[pageIndex] = [];
    io.emit("page_cleared");
  });

  // New page
  socket.on("new_page", () => {
    room.pages.push([]);
    const newIndex = room.pages.length - 1;
    io.emit("page_changed", newIndex);
    io.emit("page_data", room.pages[newIndex]);
  });

  // Undo
  socket.on("undo_request", () => {
    for (let p = room.pages.length - 1; p >= 0; p--) {
      const page = room.pages[p];
      for (let i = page.length - 1; i >= 0; i--) {
        if (page[i].userId === socket.id) {
          const removed = page.splice(i, 1)[0];
          room.redoStack[socket.id].push(removed);
          io.emit("undo_applied", page);
          return;
        }
      }
    }
  });

  // Redo
  socket.on("redo_request", () => {
    const redoStroke = room.redoStack[socket.id].pop();
    if (redoStroke) {
      room.pages[redoStroke.page].push(redoStroke);
      io.emit("page_data", room.pages[redoStroke.page]);
    }
  });

  socket.on("cursor_move", pos => {
    socket.broadcast.emit("cursor_update", {
      userId: socket.id,
      color: room.users[socket.id].color,
      ...pos
    });
  });

  socket.on("disconnect", () => {
    delete room.users[socket.id];
    delete room.redoStack[socket.id];
    io.emit("users_update", room.users);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});