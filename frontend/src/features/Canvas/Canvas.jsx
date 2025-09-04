import { useRef, useEffect, useState, useCallback } from "react";
import "./Canvas.css";
import { useSocket } from "../../context/SocketContext";
import { onFillEvent, clearCanvasEvent, drawStrokeEvent } from "../../services/emitGameEvents";

export default function Canvas({isDrawer,roomId}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineWidth, setLineWidth] = useState(5);
  const [color, setColor] = useState("#000000");
  const [tool, setTool] = useState("pen"); // 'pen' | 'eraser' | 'fill'
  const [ctx, setCtx] = useState(null);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  const socket = useSocket();
  // isDrawer = true;

  // ---------- Init ----------
  useEffect(() => {
    const canvas = canvasRef.current;
    const c = canvas.getContext("2d");
    c.lineCap = "round";
    c.lineJoin = "round";
    c.lineWidth = lineWidth;
    c.strokeStyle = color;
    c.globalCompositeOperation = "source-over";
    c.fillStyle = "#ffffff";
    c.fillRect(0, 0, canvas.width, canvas.height);
    setCtx(c);
  }, []);

  // ---------- Update ctx on settings ----------
  useEffect(() => {
    if (!ctx) return;
    ctx.lineWidth = lineWidth;
    if (tool !== "eraser") ctx.strokeStyle = color;
  }, [ctx, lineWidth, color, tool]);

  // ---------- Helpers ----------
  const getXY = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // scale factor from CSS pixels → canvas pixels
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };


  const saveState = useCallback(() => {
    if (!ctx) return;
    try {
      const snap = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      setUndoStack((u) => [...u, snap]);
      setRedoStack([]);
    } catch (_) {
      // cross-origin image drawn -> canvas tainted; skip undo
    }
  }, [ctx]);

  const undo = () => {
    if (!ctx || undoStack.length === 0) return;
    const u = [...undoStack];
    const prev = u.pop();
    setUndoStack(u);
    try {
      const cur = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      setRedoStack((r) => [...r, cur]);
      ctx.putImageData(prev, 0, 0);
      emitCanvasSnapshot();
    } catch (_) {}
  };

  const getCanvasImage = () => {
    if (!canvasRef.current) return null;
    return canvasRef.current.toDataURL("image/png"); // Base64 image string
  };

  const emitCanvasSnapshot = () => {
    const image = getCanvasImage();
    if (image) {
      socket.emit("CANVAS_SYNC", { roomId, image });
    }
  };

  const redo = () => {
    if (!ctx || redoStack.length === 0) return;
    const r = [...redoStack];
    const nxt = r.pop();
    setRedoStack(r);
    try {
      const cur = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
      setUndoStack((u) => [...u, cur]);
      ctx.putImageData(nxt, 0, 0);
      emitCanvasSnapshot();
    } catch (_) {}
  };

  const clearLocal = () => {
    if (!ctx) return;
    saveState();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#ffffff";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
  };



  // ---------- Flood Fill (bucket) ----------
  const hexToRgbA = (hex) => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m ? [parseInt(m[0x1], 16), parseInt(m[0x2], 16), parseInt(m[0x3], 16), 255] : [0, 0, 0, 255];
  };

  const colorClose = (c1, c2, tol) =>
    Math.abs(c1[0] - c2[0]) <= tol &&
    Math.abs(c1[1] - c2[1]) <= tol &&
    Math.abs(c1[2] - c2[2]) <= tol &&
    Math.abs((c1[3] ?? 255) - (c2[3] ?? 255)) <= 255; // ignore alpha tolerance

  const floodFillLocal = useCallback(
    (x, y, fillHex, tolerance = 25) => {
      if (!ctx) return;
      const w = ctx.canvas.width;
      const h = ctx.canvas.height;
      const img = ctx.getImageData(0, 0, w, h);
      const data = img.data;

      const i0 = (Math.floor(y) * w + Math.floor(x)) * 4;
      const startCol = [data[i0], data[i0 + 1], data[i0 + 2], data[i0 + 3]];
      const target = hexToRgbA(fillHex);

      // if pixel already equals target, skip
      if (
        startCol[0] === target[0] &&
        startCol[1] === target[1] &&
        startCol[2] === target[2] &&
        startCol[3] === target[3]
      ) {
        return;
      }

      const stack = [[Math.floor(x), Math.floor(y)]];
      const visited = new Uint8Array(w * h);

      while (stack.length) {
        const [cx, cy] = stack.pop();
        if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
        const p = (cy * w + cx) * 4;
        if (visited[p >> 2]) continue;
        visited[p >> 2] = 1;

        const cur = [data[p], data[p + 1], data[p + 2], data[p + 3]];
        if (colorClose(cur, startCol, tolerance) || cur[3] < 220) {
          // replace
          data[p] = target[0];
          data[p + 1] = target[1];
          data[p + 2] = target[2];
          data[p + 3] = 255;

          stack.push([cx + 1, cy]);
          stack.push([cx - 1, cy]);
          stack.push([cx, cy + 1]);
          stack.push([cx, cy - 1]);
        }
      }

      ctx.putImageData(img, 0, 0);
    },
    [ctx]
  );

  // ---------- Mouse / Touch ----------
  const start = (e) => {
    if (!isDrawer || !ctx) return;
    if (e.touches) e.preventDefault();
    const { x, y } = getXY(e);
    setLastPos({ x, y });

    if (tool === "fill") {
      saveState();
      floodFillLocal(x, y, color);
      onFillEvent(roomId, { x, y, color, tolerance: 25 });
      return;
    }

    saveState();

    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, lineWidth / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
    setIsDrawing(true);
  };

  const move = (e) => {
    if (!isDrawer || !isDrawing || !ctx) return;
    if (e.touches) e.preventDefault();
    const { x, y } = getXY(e);

    ctx.beginPath();
    if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = lineWidth;
    } else {
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
    }
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    // broadcast stroke
    drawStrokeEvent(roomId, {
      x0: lastPos.x,
      y0: lastPos.y,
      x1: x,
      y1: y,
      color,
      lineWidth,
      tool,
    });

    setLastPos({ x, y });
  };

  const end = () => {
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const clear = () => {
    if (!isDrawer) return;
    clearLocal();
    clearCanvasEvent(roomId);
  };

  const download = () => {
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  // ---------- Socket listeners (replicate actions) ----------
  useEffect(() => {
    if (!socket || !ctx) return;

    const onDraw = ({ x0, y0, x1, y1, color, lineWidth, tool }) => {
      ctx.beginPath();
      if (tool === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = lineWidth;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
      }
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    };

    const onClear = () => clearLocal();

    const onFill = ({ x, y, color, tolerance = 25 }) => {
      floodFillLocal(x, y, color, tolerance);
    };

    const onCanvasSync = ({ image }) => {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
      };
      img.src = image;
    };


    socket.on("DRAW", (payload) => {console.log("event recieved at on Draw", payload); onDraw(payload)});
    socket.on("CLEAR_CANVAS", () => onClear());
    socket.on("ON_FILL", (fillData) => {console.log("event recieved at on Fill", fillData); onFill(fillData)});
    socket.on("CANVAS_SYNC", (syncData) => {console.log("event recieved at on Canvas Sync", syncData); onCanvasSync(syncData)});

    return () => {
      socket.off("DRAW", onDraw);
      socket.off("CLEAR_CANVAS", onClear);
      socket.off("ON_FILL", onFill);
      socket.off("CANVAS_SYNC", onCanvasSync);
    };
  }, [socket, ctx]);

  return (
    <div className="canvas-wrapper">

      <canvas
        ref={canvasRef}
        className={`Canvas ${isDrawer ? "Canvas--active" : "Canvas--spectator"}`}
        onMouseDown={start}
        onMouseMove={move}
        onMouseUp={end}
        onMouseLeave={end}
        onTouchStart={start}
        onTouchMove={move}
        onTouchEnd={end}
      />
      {isDrawer && (
        <div className="canvas-toolbar">
          <div className="tool-group">
            <button onClick={() => setTool("pen")} className={tool === "pen" ? "active" : ""}>✏️</button>
            <button onClick={() => setTool("eraser")} className={tool === "eraser" ? "active" : ""}>🧽 </button>
            <button onClick={() => setTool("fill")} className={tool === "fill" ? "active" : ""}>🪣 </button>
            <button onClick={clear}>🗑️ </button>
            <button onClick={undo}>↩️ </button>
            <button onClick={redo}>↪️ </button>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            <input type="range" min="3" max="30" value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))} />
          </div>

          <div className="palette-container">
            <div className="current-tool">Selected: {tool}
            </div>
            <div className="palette">
              {["#000000","#ff0000","#00b894","#0984e3","#fdcb6e","#e84393","#00cec9","#2d3436"].map((c) => (
                <button
                  key={c}
                  className={`Swatch ${color === c ? "active" : ""}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                  title={c}
                />
              ))}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
