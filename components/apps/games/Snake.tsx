"use client";

import { useEffect, useRef, useState } from "react";
import { GameShell, useGameRunning } from "./GameShell";
import { useGameLoop } from "./useGameLoop";
import { playBeep } from "@/lib/beep";
import { useScoresStore } from "@/lib/scoresStore";

const GRID = 18;
const SWIPE_THRESHOLD = 20;

type Point = { x: number; y: number };
type Dir = "up" | "down" | "left" | "right";

const VECTORS: Record<Dir, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE: Record<Dir, Dir> = { up: "down", down: "up", left: "right", right: "left" };

function randomEmptyCell(occupied: Point[]): Point {
  let cell: Point;
  do {
    cell = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) };
  } while (occupied.some((p) => p.x === cell.x && p.y === cell.y));
  return cell;
}

function initialSnake(): Point[] {
  return [
    { x: 8, y: 9 },
    { x: 7, y: 9 },
    { x: 6, y: 9 },
  ];
}

// All mutable game state + the imperative update/render pair live in one
// hook, called from the outer (non-descendant) Snake component. The
// canvas-rendering descendant below calls useGameLoop with what this
// returns — kept separate because useGameLoop needs `running` from
// GameShell's context, which is only available to an actual descendant
// of GameShell, not the component that renders GameShell itself.
function useSnakeGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cellSizeRef = useRef(16);
  const dprRef = useRef(1);
  const snakeRef = useRef<Point[]>(initialSnake());
  const dirRef = useRef<Dir>("right");
  const nextDirRef = useRef<Dir>("right");
  const foodRef = useRef<Point>(randomEmptyCell(initialSnake()));
  const tickAccRef = useRef(0);
  const overRef = useRef(false);
  const touchStartRef = useRef<Point | null>(null);

  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const scores = useScoresStore((s) => s.scores);
  const submit = useScoresStore((s) => s.submit);
  const best = scores.snake;

  useEffect(() => {
    if (gameOver) submit("snake", score, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    function resize() {
      if (!canvas || !container) return;
      const dpr = window.devicePixelRatio || 1;
      const size = Math.max(1, Math.min(container.clientWidth, container.clientHeight));
      dprRef.current = dpr;
      cellSizeRef.current = size / GRID;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    }
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  function resetGame() {
    snakeRef.current = initialSnake();
    dirRef.current = "right";
    nextDirRef.current = "right";
    foodRef.current = randomEmptyCell(snakeRef.current);
    tickAccRef.current = 0;
    overRef.current = false;
    setScore(0);
    setGameOver(false);
  }

  function setDirection(d: Dir) {
    if (OPPOSITE[d] === dirRef.current) return;
    nextDirRef.current = d;
  }

  function step() {
    dirRef.current = nextDirRef.current;
    const head = snakeRef.current[0];
    const vec = VECTORS[dirRef.current];
    const newHead = { x: head.x + vec.x, y: head.y + vec.y };
    const hitWall = newHead.x < 0 || newHead.x >= GRID || newHead.y < 0 || newHead.y >= GRID;
    const hitSelf = snakeRef.current.some((p) => p.x === newHead.x && p.y === newHead.y);
    if (hitWall || hitSelf) {
      overRef.current = true;
      playBeep(140, 220, "sawtooth");
      setGameOver(true);
      return;
    }
    const ateFood = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
    const newSnake = [newHead, ...snakeRef.current];
    if (ateFood) {
      playBeep(660, 70);
      foodRef.current = randomEmptyCell(newSnake);
      setScore((s) => s + 1);
    } else {
      newSnake.pop();
    }
    snakeRef.current = newSnake;
  }

  function update(dt: number) {
    if (overRef.current) return;
    const interval = Math.max(55, 170 - snakeRef.current.length * 4);
    tickAccRef.current += dt;
    while (tickAccRef.current >= interval && !overRef.current) {
      tickAccRef.current -= interval;
      step();
    }
  }

  function render() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    const cell = cellSizeRef.current;
    ctx.fillStyle = "#001a00";
    ctx.fillRect(0, 0, cell * GRID, cell * GRID);
    const food = foodRef.current;
    ctx.fillStyle = "#ffb300";
    ctx.fillRect(food.x * cell + 2, food.y * cell + 2, cell - 4, cell - 4);
    snakeRef.current.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#00ff88" : "#00aa55";
      ctx.fillRect(seg.x * cell + 1, seg.y * cell + 1, cell - 2, cell - 2);
    });
    ctx.restore();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const map: Record<string, Dir> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    const dir = map[e.key];
    if (!dir) return;
    e.preventDefault();
    setDirection(dir);
  }

  function onTouchStart(e: React.PointerEvent) {
    touchStartRef.current = { x: e.clientX, y: e.clientY };
  }

  function onTouchEnd(e: React.PointerEvent) {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
    if (Math.abs(dx) > Math.abs(dy)) setDirection(dx > 0 ? "right" : "left");
    else setDirection(dy > 0 ? "down" : "up");
  }

  return {
    containerRef,
    canvasRef,
    score,
    gameOver,
    best,
    resetGame,
    setDirection,
    update,
    render,
    handleKeyDown,
    onTouchStart,
    onTouchEnd,
  };
}

function SnakeBoard({ game }: { game: ReturnType<typeof useSnakeGame> }) {
  const running = useGameRunning();
  useGameLoop(game.update, game.render, running);
  const {
    containerRef,
    canvasRef,
    score,
    gameOver,
    best,
    setDirection,
    onTouchStart,
    onTouchEnd,
  } = game;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 p-2">
      <div
        ref={containerRef}
        className="relative aspect-square w-full max-w-[320px] touch-none"
        onPointerDown={onTouchStart}
        onPointerUp={onTouchEnd}
      >
        <canvas ref={canvasRef} style={{ touchAction: "none" }} />
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <p className="bg-white px-2 py-1 font-bold">Game over — {score}</p>
          </div>
        )}
      </div>
      <p className="text-xs">
        Score: {score}
        {best !== undefined ? ` — Best: ${best}` : ""}
      </p>
      <div className="grid grid-cols-3 gap-1" role="group" aria-label="Direction pad">
        <span />
        <button type="button" aria-label="Up" onClick={() => setDirection("up")}>
          ▲
        </button>
        <span />
        <button type="button" aria-label="Left" onClick={() => setDirection("left")}>
          ◀
        </button>
        <button type="button" aria-label="Down" onClick={() => setDirection("down")}>
          ▼
        </button>
        <button type="button" aria-label="Right" onClick={() => setDirection("right")}>
          ▶
        </button>
      </div>
    </div>
  );
}

export default function Snake({ windowId }: { windowId: string }) {
  const game = useSnakeGame();
  return (
    <GameShell
      windowId={windowId}
      instructions="Arrow keys or swipe/D-pad. Speed ramps as you grow."
      onReset={game.resetGame}
      onKeyDown={game.handleKeyDown}
    >
      <SnakeBoard game={game} />
    </GameShell>
  );
}
