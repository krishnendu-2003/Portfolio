"use client";

import { useEffect, useRef, useState } from "react";

type Tool =
  | "pencil"
  | "brush"
  | "rainbow"
  | "eraser"
  | "line"
  | "rect"
  | "ellipse"
  | "fill"
  | "stamp";

const SIZES = [2, 5, 10] as const;

const PALETTE = [
  "#000000",
  "#ffffff",
  "#808080",
  "#c0c0c0",
  "#800000",
  "#ff0000",
  "#808000",
  "#ffff00",
  "#008000",
  "#00ff00",
  "#008080",
  "#00ffff",
  "#000080",
  "#0000ff",
  "#800080",
  "#ff00ff",
];

const UNDO_LIMIT = 12;

type Point = { x: number; y: number };

function drawStamp(ctx: CanvasRenderingContext2D, index: number, x: number, y: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  const r = 14;
  switch (index) {
    case 0: {
      // star
      ctx.beginPath();
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const radius = i % 2 === 0 ? r : r / 2.3;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 1: {
      // heart-ish blob
      ctx.beginPath();
      ctx.arc(-r / 2.4, -r / 4, r / 2.2, 0, Math.PI * 2);
      ctx.arc(r / 2.4, -r / 4, r / 2.2, 0, Math.PI * 2);
      ctx.moveTo(-r, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(r, 0);
      ctx.fill();
      break;
    }
    case 2: {
      // diamond
      ctx.beginPath();
      ctx.moveTo(0, -r);
      ctx.lineTo(r * 0.75, 0);
      ctx.lineTo(0, r);
      ctx.lineTo(-r * 0.75, 0);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case 3: {
      // spiral swirl
      ctx.beginPath();
      for (let t = 0; t < Math.PI * 4; t += 0.2) {
        const radius = (t / (Math.PI * 4)) * r;
        const px = Math.cos(t) * radius;
        const py = Math.sin(t) * radius;
        if (t === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
      break;
    }
    case 4: {
      // flower: five petals as circles around a center
      for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(angle) * r * 0.5, Math.sin(angle) * r * 0.5, r * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    default: {
      // little house
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, r * 0.6);
      ctx.lineTo(-r * 0.7, -r * 0.1);
      ctx.lineTo(0, -r);
      ctx.lineTo(r * 0.7, -r * 0.1);
      ctx.lineTo(r * 0.7, r * 0.6);
      ctx.closePath();
      ctx.stroke();
      break;
    }
  }
  ctx.restore();
}

function floodFill(ctx: CanvasRenderingContext2D, w: number, h: number, startX: number, startY: number, fillColor: string) {
  const img = ctx.getImageData(0, 0, w, h);
  const data = img.data;
  const idx = (x: number, y: number) => (y * w + x) * 4;
  const startIdx = idx(startX, startY);
  const target: [number, number, number, number] = [
    data[startIdx],
    data[startIdx + 1],
    data[startIdx + 2],
    data[startIdx + 3],
  ];

  const tmp = document.createElement("canvas");
  tmp.width = 1;
  tmp.height = 1;
  const tctx = tmp.getContext("2d");
  if (!tctx) return;
  tctx.fillStyle = fillColor;
  tctx.fillRect(0, 0, 1, 1);
  const fill = tctx.getImageData(0, 0, 1, 1).data;
  const fillRgba: [number, number, number, number] = [fill[0], fill[1], fill[2], fill[3]];

  if (
    target[0] === fillRgba[0] &&
    target[1] === fillRgba[1] &&
    target[2] === fillRgba[2] &&
    target[3] === fillRgba[3]
  ) {
    return;
  }

  const matches = (i: number) =>
    data[i] === target[0] && data[i + 1] === target[1] && data[i + 2] === target[2] && data[i + 3] === target[3];

  const stack: [number, number][] = [[startX, startY]];
  while (stack.length > 0) {
    const [x, y] = stack.pop() as [number, number];
    if (x < 0 || x >= w || y < 0 || y >= h) continue;
    const i = idx(x, y);
    if (!matches(i)) continue;
    data[i] = fillRgba[0];
    data[i + 1] = fillRgba[1];
    data[i + 2] = fillRgba[2];
    data[i + 3] = fillRgba[3];
    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }
  ctx.putImageData(img, 0, 0);
}

export default function Sketchpad() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const undoStack = useRef<string[]>([]);
  const strokeBase = useRef<ImageData | null>(null);
  const lastPoint = useRef<Point | null>(null);
  const hueRef = useRef(0);
  const drawingRef = useRef(false);

  const [tool, setTool] = useState<Tool>("pencil");
  const [size, setSize] = useState<number>(SIZES[1]);
  const [color, setColor] = useState("#000000");
  const [stampIndex, setStampIndex] = useState(0);
  const [watermark, setWatermark] = useState(true);
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [canUndo, setCanUndo] = useState(false);

  function getCanvasPoint(e: React.PointerEvent<HTMLCanvasElement>): Point {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function pushSnapshot() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const data = canvas.toDataURL("image/png");
    undoStack.current.push(data);
    if (undoStack.current.length > UNDO_LIMIT) undoStack.current.shift();
    setCanUndo(undoStack.current.length > 1);
  }

  function drawImageToCanvas(dataUrl: string) {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      ctx.restore();
    };
    img.src = dataUrl;
  }

  function fillWhite() {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  // Backing-store sizing, devicePixelRatio-aware. Redraws the last
  // snapshot on resize instead of clearing.
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    function resize() {
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const prev = undoStack.current[undoStack.current.length - 1];
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctxRef.current = ctx;
      if (prev) drawImageToCanvas(prev);
      else fillWhite();
    }

    resize();
    if (undoStack.current.length === 0) {
      pushSnapshot();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  function beginStroke(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    canvas.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    if (watermark) setWatermark(false);
    const point = getCanvasPoint(e);
    lastPoint.current = point;
    hueRef.current = 0;

    if (tool === "fill") {
      const dpr = window.devicePixelRatio || 1;
      floodFill(
        ctx,
        canvas.width,
        canvas.height,
        Math.round(point.x * dpr),
        Math.round(point.y * dpr),
        color
      );
      return;
    }
    if (tool === "stamp") {
      drawStamp(ctx, stampIndex, point.x, point.y, color);
      return;
    }
    if (tool === "line" || tool === "rect" || tool === "ellipse") {
      strokeBase.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      return;
    }
    // freehand tools: draw a dot immediately so a tap registers
    strokeSegment(ctx, point, point);
  }

  function strokeSegment(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "eraser") {
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = size * 2;
    } else if (tool === "rainbow") {
      ctx.strokeStyle = `hsl(${hueRef.current}, 100%, 50%)`;
      ctx.lineWidth = size;
      hueRef.current = (hueRef.current + 6) % 360;
    } else if (tool === "brush") {
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 1.8;
      ctx.shadowColor = color;
      ctx.shadowBlur = size / 2;
    } else {
      ctx.strokeStyle = color;
      ctx.lineWidth = size;
    }
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawPreviewShape(ctx: CanvasRenderingContext2D, from: Point, to: Point) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.lineJoin = "round";
    if (tool === "line") {
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
    } else if (tool === "rect") {
      ctx.fillStyle = color;
      ctx.fillRect(from.x, from.y, to.x - from.x, to.y - from.y);
    } else if (tool === "ellipse") {
      const rx = Math.abs(to.x - from.x) / 2;
      const ry = Math.abs(to.y - from.y) / 2;
      const cx = (from.x + to.x) / 2;
      const cy = (from.y + to.y) / 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function onPointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return;
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    const point = getCanvasPoint(e);

    if (tool === "line" || tool === "rect" || tool === "ellipse") {
      if (strokeBase.current) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.putImageData(strokeBase.current, 0, 0);
        ctx.restore();
      }
      const dpr = window.devicePixelRatio || 1;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (lastPoint.current) drawPreviewShape(ctx, lastPoint.current, point);
      return;
    }

    if (tool === "fill" || tool === "stamp") return;

    if (lastPoint.current) strokeSegment(ctx, lastPoint.current, point);
    lastPoint.current = point;
  }

  function endStroke() {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    strokeBase.current = null;
    lastPoint.current = null;
    pushSnapshot();
  }

  function handleUndo() {
    if (undoStack.current.length <= 1) return;
    undoStack.current.pop();
    const prev = undoStack.current[undoStack.current.length - 1];
    if (prev) drawImageToCanvas(prev);
    setCanUndo(undoStack.current.length > 1);
  }

  function handleClear() {
    fillWhite();
    pushSnapshot();
    setConfirmingClear(false);
  }

  function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sketchpad.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, "image/png");
  }

  const TOOL_BUTTONS: { id: Tool; label: string; glyph: string }[] = [
    { id: "pencil", label: "Pencil", glyph: "✎" },
    { id: "brush", label: "Brush", glyph: "🖌" },
    { id: "rainbow", label: "Rainbow brush", glyph: "🌈" },
    { id: "eraser", label: "Eraser", glyph: "▭" },
    { id: "line", label: "Straight line", glyph: "／" },
    { id: "rect", label: "Filled rectangle", glyph: "▮" },
    { id: "ellipse", label: "Ellipse outline", glyph: "◯" },
    { id: "fill", label: "Flood fill", glyph: "▨" },
    { id: "stamp", label: "Stamp", glyph: "★" },
  ];

  return (
    <div className="flex h-full flex-col gap-1 bg-white p-1 text-xs">
      <div className="flex flex-wrap gap-1 border-b border-gray-400 pb-1" role="toolbar" aria-label="Sketchpad tools">
        {TOOL_BUTTONS.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-label={t.label}
            aria-pressed={tool === t.id}
            title={t.label}
            className="w-7"
            onClick={() => setTool(t.id)}
            style={tool === t.id ? { outline: "1px dotted #000000", outlineOffset: -2 } : undefined}
          >
            {t.glyph}
          </button>
        ))}
        {tool === "stamp" && (
          <div className="flex items-center gap-1" role="group" aria-label="Stamp choice">
            {Array.from({ length: 6 }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Stamp ${i + 1}`}
                aria-pressed={stampIndex === i}
                className="w-6"
                onClick={() => setStampIndex(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-gray-400 pb-1">
        <div role="group" aria-label="Brush size" className="flex items-center gap-1">
          {SIZES.map((s) => (
            <button
              key={s}
              type="button"
              aria-label={`Size ${s}`}
              aria-pressed={size === s}
              className="w-6"
              onClick={() => setSize(s)}
              style={size === s ? { outline: "1px dotted #000000", outlineOffset: -2 } : undefined}
            >
              {s}
            </button>
          ))}
        </div>
        <div role="group" aria-label="Color palette" className="flex flex-wrap gap-0.5">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Color ${c}`}
              aria-pressed={color === c}
              className="h-4 w-4 border border-gray-500"
              style={{
                background: c,
                outline: color === c ? "1px dotted #000000" : "none",
                outlineOffset: 1,
              }}
              onClick={() => setColor(c)}
            />
          ))}
          <input
            type="color"
            aria-label="Custom color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-4 w-6"
          />
        </div>
      </div>

      <div ref={containerRef} className="relative min-h-0 flex-1">
        <canvas
          ref={canvasRef}
          className="h-full w-full touch-none bg-white"
          style={{ touchAction: "none" }}
          onPointerDown={beginStroke}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerCancel={endStroke}
        />
        {watermark && (
          <p
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center text-gray-300 select-none"
          >
            draw something
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-400 pt-1">
        <button type="button" onClick={handleUndo} disabled={!canUndo}>
          Undo
        </button>
        {confirmingClear ? (
          <span className="flex items-center gap-1">
            Clear canvas?
            <button type="button" onClick={handleClear}>
              Yes
            </button>
            <button type="button" onClick={() => setConfirmingClear(false)}>
              No
            </button>
          </span>
        ) : (
          <button type="button" onClick={() => setConfirmingClear(true)}>
            Clear
          </button>
        )}
        <button type="button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
}
