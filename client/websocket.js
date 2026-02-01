import { drawStroke, clearCanvas, drawCursors } from "./canvas.js";

export const socket = io();
const cursors = {};

export function setupSocketHandlers() {

  socket.on("stroke_draw", segment => {
    drawStroke(segment);
  });

  socket.on("history_sync", strokes => {
    clearCanvas();
    strokes.forEach(drawStroke);
  });

  socket.on("undo_applied", strokes => {
    clearCanvas();
    strokes.forEach(drawStroke);
  });

  //CURSORS
  socket.on("cursor_update", data => {
    cursors[data.userId] = data;
    drawCursors(cursors);
  });

  //  USERS
  socket.on("users_update", users => {
    const panel = document.getElementById("usersPanel");
    panel.innerHTML = "<b>Online Users</b><br/>";

    Object.entries(users).forEach(([id, user]) => {
      const div = document.createElement("div");
      div.style.color = user.color;
      div.textContent = id.substring(0, 5);
      panel.appendChild(div);
    });
  });
}
