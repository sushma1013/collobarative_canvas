import {
  initCanvas,
  getCanvasCoordinates,
  drawStroke
} from "./canvas.js";

import { socket, setupSocketHandlers } from "./websocket.js";

initCanvas();
setupSocketHandlers();

const canvas = document.getElementById("draw-canvas");

let isDrawing = false;
let currentTool = "brush";
let currentStroke = null;

// --------------------
// Tool Buttons
// --------------------
document.getElementById("brushBtn").onclick = () => currentTool = "brush";
document.getElementById("eraserBtn").onclick = () => currentTool = "eraser";

// --------------------
// Theme Toggle
// --------------------
document.getElementById("themeBtn").onclick = () => {
  document.body.classList.toggle("dark");
};

// --------------------
// Drawing
// --------------------
canvas.addEventListener("mousedown", e => {
  isDrawing = true;
  currentStroke = {
    color: document.getElementById("colorPicker").value,
    width: Number(document.getElementById("strokeWidth").value),
    tool: currentTool,
    points: [getCanvasCoordinates(e)]
  };
});

canvas.addEventListener("mousemove", e => {
  const point = getCanvasCoordinates(e);
  socket.emit("cursor_move", point);

  if (!isDrawing) return;

  currentStroke.points.push(point);

  const segment = {
    color: currentStroke.color,
    width: currentStroke.width,
    tool: currentStroke.tool,
    points: currentStroke.points.slice(-2)
  };

  drawStroke(segment);
  socket.emit("drawing_step", segment);
});

canvas.addEventListener("mouseup", () => {
  if (!isDrawing) return;
  isDrawing = false;
  socket.emit("drawing_end", currentStroke);
});

// --------------------
// Undo / Redo
// --------------------
document.getElementById("undoBtn").onclick = () => {
  socket.emit("undo_request");
};

document.getElementById("redoBtn").onclick = () => {
  socket.emit("redo_request");
};
