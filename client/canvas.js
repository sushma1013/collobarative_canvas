export let canvas, ctx, cursorCanvas, cursorCtx;

export function initCanvas() {
  canvas = document.getElementById("draw-canvas");
  cursorCanvas = document.getElementById("cursor-canvas");

  ctx = canvas.getContext("2d");
  cursorCtx = cursorCanvas.getContext("2d");

  resize();
  window.addEventListener("resize", resize);
}

function resize() {
  const dpr = window.devicePixelRatio || 1;
  const w = window.innerWidth;
  const h = window.innerHeight;

  [canvas, cursorCanvas].forEach(c => {
    c.width = w * dpr;
    c.height = h * dpr;
    c.style.width = w + "px";
    c.style.height = h + "px";
    c.getContext("2d").setTransform(dpr, 0, 0, dpr, 0, 0);
  });
}

export function getCanvasCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

export function drawStroke(stroke) {
  ctx.save();

  ctx.lineCap = "round";
  ctx.lineWidth = stroke.width;

  if (stroke.tool === "eraser") {
    ctx.globalCompositeOperation = "destination-out";
    ctx.strokeStyle = "rgba(0,0,0,1)";
  } else {
    ctx.globalCompositeOperation = "source-over";
    ctx.strokeStyle = stroke.color;
  }

  ctx.beginPath();
  stroke.points.forEach((p, i) => {
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  });
  ctx.stroke();

  ctx.restore();
}

export function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

export function drawCursors(cursors) {
  cursorCtx.clearRect(0, 0, cursorCanvas.width, cursorCanvas.height);

  Object.values(cursors).forEach(c => {
    cursorCtx.beginPath();
    cursorCtx.arc(c.x, c.y, 5, 0, Math.PI * 2);
    cursorCtx.fillStyle = c.color;
    cursorCtx.fill();
  });
}
