"use client";

import { useEffect, useRef, useState } from "react";
import { GameShell, useGameRunning } from "./GameShell";
import { useGameLoop } from "./useGameLoop";
import { playBeep } from "@/lib/beep";
import { useScoresStore } from "@/lib/scoresStore";

const COLS = 10;
const ROWS = 20;
const PREVIEW_COLS = 4;
const TOTAL_COLS = COLS + PREVIEW_COLS;

type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

const PIECES: Record<PieceType, number[][][]> = {
  I: [
    [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    [
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
      [0, 0, 1, 0],
    ],
    [
      [0, 0, 0, 0],
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
    ],
    [
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
      [0, 1, 0, 0],
    ],
  ],
  O: [
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
    [
      [1, 1],
      [1, 1],
    ],
  ],
  T: [
    [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  S: [
    [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 0, 0],
      [0, 1, 1],
      [1, 1, 0],
    ],
    [
      [1, 0, 0],
      [1, 1, 0],
      [0, 1, 0],
    ],
  ],
  Z: [
    [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 0, 1],
      [0, 1, 1],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 1, 0],
      [1, 1, 0],
      [1, 0, 0],
    ],
  ],
  J: [
    [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 1],
      [0, 1, 0],
      [0, 1, 0],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [0, 0, 1],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [1, 1, 0],
    ],
  ],
  L: [
    [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 1],
    ],
    [
      [0, 0, 0],
      [1, 1, 1],
      [1, 0, 0],
    ],
    [
      [1, 1, 0],
      [0, 1, 0],
      [0, 1, 0],
    ],
  ],
};

const PIECE_TYPES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];
const LINE_POINTS = [0, 40, 100, 300, 1200];

type Active = { type: PieceType; rotation: number; x: number; y: number };

function randomType(): PieceType {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

function emptyBoard(): number[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(0));
}

function matrixFor(active: Active): number[][] {
  return PIECES[active.type][active.rotation];
}

function canPlace(board: number[][], matrix: number[][], x: number, y: number): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue;
      const px = x + c;
      const py = y + r;
      if (px < 0 || px >= COLS || py >= ROWS) return false;
      if (py < 0) continue;
      if (board[py][px]) return false;
    }
  }
  return true;
}

function spawnPiece(type: PieceType): Active {
  const width = PIECES[type][0][0].length;
  return { type, rotation: 0, x: Math.floor((COLS - width) / 2), y: -1 };
}

function useTetrisGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellSizeRef = useRef(16);
  const dprRef = useRef(1);

  const boardRef = useRef<number[][]>(emptyBoard());
  const activeRef = useRef<Active>(spawnPiece(randomType()));
  const nextTypeRef = useRef<PieceType>(randomType());
  const tickAccRef = useRef(0);
  const overRef = useRef(false);
  const softDropRef = useRef(false);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const scores = useScoresStore((s) => s.scores);
  const submit = useScoresStore((s) => s.submit);
  const best = scores.tetris;

  useEffect(() => {
    if (gameOver) submit("tetris", score, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    function resize() {
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      const byHeight = container.clientHeight / ROWS;
      const byWidth = container.clientWidth / TOTAL_COLS;
      const cell = Math.max(4, Math.floor(Math.min(byHeight, byWidth)));
      dprRef.current = dpr;
      cellSizeRef.current = cell;
      const w = cell * TOTAL_COLS;
      const h = cell * ROWS;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  function resetGame() {
    boardRef.current = emptyBoard();
    activeRef.current = spawnPiece(randomType());
    nextTypeRef.current = randomType();
    tickAccRef.current = 0;
    overRef.current = false;
    softDropRef.current = false;
    setScore(0);
    setLines(0);
    setGameOver(false);
  }

  function lockAndAdvance() {
    const board = boardRef.current;
    const matrix = matrixFor(activeRef.current);
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (!matrix[r][c]) continue;
        const py = activeRef.current.y + r;
        const px = activeRef.current.x + c;
        if (py >= 0) board[py][px] = 1;
      }
    }

    let cleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r].every((cell) => cell)) {
        board.splice(r, 1);
        board.unshift(Array(COLS).fill(0));
        cleared++;
        r++;
      }
    }
    if (cleared > 0) {
      playBeep(cleared >= 4 ? 880 : 620, 120, "triangle");
      setLines((l) => l + cleared);
      const level = Math.floor((lines + cleared) / 10) + 1;
      setScore((s) => s + LINE_POINTS[cleared] * level);
    } else {
      playBeep(220, 40);
    }

    const next = spawnPiece(nextTypeRef.current);
    nextTypeRef.current = randomType();
    if (!canPlace(board, matrixFor(next), next.x, next.y)) {
      overRef.current = true;
      setGameOver(true);
      playBeep(140, 260, "sawtooth");
      return;
    }
    activeRef.current = next;
  }

  function tryMove(dx: number, dy: number): boolean {
    const a = activeRef.current;
    const matrix = matrixFor(a);
    if (canPlace(boardRef.current, matrix, a.x + dx, a.y + dy)) {
      activeRef.current = { ...a, x: a.x + dx, y: a.y + dy };
      return true;
    }
    return false;
  }

  function rotate() {
    const a = activeRef.current;
    const nextRotation = (a.rotation + 1) % 4;
    const matrix = PIECES[a.type][nextRotation];
    // No wall kicks — just try the in-place rotation, then a couple of
    // simple horizontal nudges so rotating near a wall doesn't just fail.
    for (const dx of [0, -1, 1, -2, 2]) {
      if (canPlace(boardRef.current, matrix, a.x + dx, a.y)) {
        activeRef.current = { ...a, rotation: nextRotation, x: a.x + dx };
        playBeep(440, 40);
        return;
      }
    }
  }

  function hardDrop() {
    let dropped = 0;
    while (tryMove(0, 1)) dropped++;
    if (dropped > 0) setScore((s) => s + dropped * 2);
    lockAndAdvance();
  }

  function update(dt: number) {
    if (overRef.current) return;
    const level = Math.floor(lines / 10) + 1;
    const baseInterval = Math.max(90, 800 - (level - 1) * 60);
    const interval = softDropRef.current ? Math.min(50, baseInterval) : baseInterval;
    tickAccRef.current += dt;
    while (tickAccRef.current >= interval && !overRef.current) {
      tickAccRef.current -= interval;
      if (!tryMove(0, 1)) {
        lockAndAdvance();
        break;
      }
    }
  }

  function render() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    const cell = cellSizeRef.current;

    ctx.fillStyle = "#9bbc0f";
    ctx.fillRect(0, 0, cell * TOTAL_COLS, cell * ROWS);

    function drawCell(gx: number, gy: number) {
      ctx!.fillStyle = "#306230";
      ctx!.fillRect(gx * cell + 1, gy * cell + 1, cell - 2, cell - 2);
      ctx!.strokeStyle = "#0f380f";
      ctx!.lineWidth = 1;
      ctx!.strokeRect(gx * cell + 1, gy * cell + 1, cell - 2, cell - 2);
    }

    const board = boardRef.current;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c]) drawCell(c, r);
      }
    }

    const a = activeRef.current;
    const matrix = matrixFor(a);
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (!matrix[r][c]) continue;
        const py = a.y + r;
        if (py < 0) continue;
        drawCell(a.x + c, py);
      }
    }

    // playfield / preview divider
    ctx.strokeStyle = "#0f380f";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(COLS * cell, 0);
    ctx.lineTo(COLS * cell, ROWS * cell);
    ctx.stroke();

    // next-piece preview
    const nextMatrix = PIECES[nextTypeRef.current][0];
    const previewOriginX = COLS + 1;
    for (let r = 0; r < nextMatrix.length; r++) {
      for (let c = 0; c < nextMatrix[r].length; c++) {
        if (!nextMatrix[r][c]) continue;
        drawCell(previewOriginX + c, r + 1);
      }
    }

    ctx.restore();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (overRef.current) return;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        tryMove(-1, 0);
        break;
      case "ArrowRight":
        e.preventDefault();
        tryMove(1, 0);
        break;
      case "ArrowDown":
        e.preventDefault();
        softDropRef.current = true;
        break;
      case "ArrowUp":
        e.preventDefault();
        rotate();
        break;
      case " ":
        e.preventDefault();
        hardDrop();
        break;
      default:
        break;
    }
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowDown") softDropRef.current = false;
  }

  return {
    containerRef,
    canvasRef,
    score,
    lines,
    gameOver,
    best,
    resetGame,
    update,
    render,
    handleKeyDown,
    handleKeyUp,
    tryMove,
    rotate,
    hardDrop,
  };
}

function TetrisBoard({ game }: { game: ReturnType<typeof useTetrisGame> }) {
  const running = useGameRunning();
  useGameLoop(game.update, game.render, running);
  const { containerRef, canvasRef, score, lines, gameOver, best, tryMove, rotate, hardDrop } = game;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-2">
      <div ref={containerRef} className="relative h-full max-h-full w-full flex-1">
        <canvas ref={canvasRef} className="mx-auto block" />
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p className="bg-white px-2 py-1 text-xs font-bold">Game over — {score}</p>
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold" style={{ color: "#0f380f" }}>
        Score: {score} — Lines: {lines}
        {best !== undefined ? ` — Best: ${best}` : ""}
      </p>
      <div className="grid grid-cols-3 gap-1" role="group" aria-label="Tetris touch controls">
        <button type="button" aria-label="Move left" onClick={() => tryMove(-1, 0)}>
          ◀
        </button>
        <button type="button" aria-label="Rotate" onClick={() => rotate()}>
          ⟳
        </button>
        <button type="button" aria-label="Move right" onClick={() => tryMove(1, 0)}>
          ▶
        </button>
        <span />
        <button type="button" aria-label="Hard drop" onClick={() => hardDrop()}>
          ▼▼
        </button>
        <span />
      </div>
    </div>
  );
}

export default function Tetris({ windowId }: { windowId: string }) {
  const game = useTetrisGame();
  return (
    <GameShell
      windowId={windowId}
      instructions="Arrows to move/rotate, Space to drop."
      onReset={game.resetGame}
      onKeyDown={game.handleKeyDown}
      onKeyUp={game.handleKeyUp}
    >
      <TetrisBoard game={game} />
    </GameShell>
  );
}
