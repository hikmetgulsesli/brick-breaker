/**
 * Game Canvas Component
 * 
 * Renders the game using HTML5 Canvas with:
 * - Ball physics and movement
 * - Paddle control (mouse/touch)
 * - Brick rendering and collision
 * - Life system integration
 * - Game state management
 */

'use client';

import { useRef, useEffect, useCallback } from 'react';
import type { Ball, Paddle, Brick, GameBounds } from '../entities/types';
import { BRICK_COLORS, BRICK_WIDTH, BRICK_HEIGHT, BRICK_PADDING } from '../entities/Brick';
import { getLevel } from '../entities/levels';
import {
  checkBallPaddleCollision,
  checkBallWallCollision,
  checkAllBrickCollisions,
  calculatePaddleBounceVelocity,
  resolveBallCollision,
  vec2,
  multiply,
  add,
} from '../lib/collision';
import { isBallOutOfBounds } from '../lib/gameReducer';

interface GameCanvasProps {
  levelNumber: number;
  onLifeLost: () => void;
  onScoreAdd: (points: number) => void;
  onLevelComplete: () => void;
  onProgressUpdate: (destroyed: number, total: number) => void;
  isPaused: boolean;
}

/** Canvas dimensions */
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

/** Game constants */
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const PADDLE_Y = CANVAS_HEIGHT - 50;
const BALL_RADIUS = 8;
const INITIAL_BALL_SPEED = 300; // pixels per second

/** Points per brick durability */
const BRICK_POINTS = {
  1: 10,
  2: 20,
  3: 30,
} as const;

export function GameCanvas({
  levelNumber,
  onLifeLost,
  onScoreAdd,
  onLevelComplete,
  onProgressUpdate,
  isPaused,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const gameLoopRef = useRef<((timestamp: number) => void) | null>(null);
  
  // Game state refs (to avoid closure issues in animation loop)
  const ballRef = useRef<Ball>({
    position: vec2(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2),
    velocity: vec2(INITIAL_BALL_SPEED * 0.5, INITIAL_BALL_SPEED),
    radius: BALL_RADIUS,
    speed: INITIAL_BALL_SPEED,
  });
  
  const paddleRef = useRef<Paddle>({
    position: vec2((CANVAS_WIDTH - PADDLE_WIDTH) / 2, PADDLE_Y),
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });
  
  const bricksRef = useRef<Brick[]>([]);
  const mouseXRef = useRef<number>(CANVAS_WIDTH / 2);
  const isPausedRef = useRef<boolean>(isPaused);
  const bricksDestroyedRef = useRef<number>(0);

  // Sync pause state
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Initialize bricks from level data
  const initializeBricks = useCallback((levelNum: number): Brick[] => {
    const level = getLevel(levelNum);
    if (!level) return [];

    const bricks: Brick[] = [];
    const { grid, rows, cols } = level.pattern;
    
    // Calculate starting position to center bricks
    const totalWidth = cols * (BRICK_WIDTH + BRICK_PADDING);
    const startX = (CANVAS_WIDTH - totalWidth) / 2;
    const startY = 80;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const durability = grid[row][col];
        if (durability > 0) {
          bricks.push({
            id: `brick-${row}-${col}`,
            position: vec2(
              startX + col * (BRICK_WIDTH + BRICK_PADDING),
              startY + row * (BRICK_HEIGHT + BRICK_PADDING)
            ),
            width: BRICK_WIDTH,
            height: BRICK_HEIGHT,
            durability: durability as 1 | 2 | 3,
            isDestroyed: false,
          });
        }
      }
    }

    bricksDestroyedRef.current = 0;
    return bricks;
  }, []);

  // Reset ball to starting position
  const resetBall = useCallback(() => {
    ballRef.current = {
      position: vec2(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2),
      velocity: vec2(
        INITIAL_BALL_SPEED * (Math.random() > 0.5 ? 0.5 : -0.5),
        INITIAL_BALL_SPEED
      ),
      radius: BALL_RADIUS,
      speed: INITIAL_BALL_SPEED,
    };
  }, []);

  // Initialize level
  useEffect(() => {
    bricksRef.current = initializeBricks(levelNumber);
    resetBall();
  }, [levelNumber, initializeBricks, resetBall]);

  // Handle mouse/touch movement
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    mouseXRef.current = Math.max(
      PADDLE_WIDTH / 2,
      Math.min(CANVAS_WIDTH - PADDLE_WIDTH / 2, x)
    );
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.touches[0].clientX - rect.left) * scaleX;
    mouseXRef.current = Math.max(
      PADDLE_WIDTH / 2,
      Math.min(CANVAS_WIDTH - PADDLE_WIDTH / 2, x)
    );
  }, []);

  // Draw a single brick with neon glow
  const drawBrick = useCallback((ctx: CanvasRenderingContext2D, brick: Brick) => {
    if (brick.isDestroyed) return;

    const colors = BRICK_COLORS[brick.durability];
    const { position, width, height } = brick;
    const x = position.x;
    const y = position.y;

    // Glow effect
    ctx.shadowBlur = 15;
    ctx.shadowColor = colors.glow;

    // Fill
    ctx.fillStyle = colors.fill;
    ctx.fillRect(x, y, width, height);

    // Border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, width, height / 2);

    // Reset shadow
    ctx.shadowBlur = 0;

    // Durability indicator (cracks for damaged bricks)
    if (brick.durability < 3) {
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 5, y + 5);
      ctx.lineTo(x + 10, y + 10);
      ctx.moveTo(x + width - 5, y + 5);
      ctx.lineTo(x + width - 10, y + 10);
      ctx.stroke();
    }
  }, []);

  // Draw the paddle with neon glow
  const drawPaddle = useCallback((ctx: CanvasRenderingContext2D, paddle: Paddle) => {
    const { position, width, height } = paddle;
    const x = position.x;
    const y = position.y;

    // Glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0, 212, 255, 0.6)';

    // Main body
    ctx.fillStyle = '#00d4ff';
    ctx.fillRect(x, y, width, height);

    // Top highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillRect(x, y, width, 3);

    // Side glow lines
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + 5, y);
    ctx.lineTo(x + 5, y + height);
    ctx.moveTo(x + width - 5, y);
    ctx.lineTo(x + width - 5, y + height);
    ctx.stroke();

    ctx.shadowBlur = 0;
  }, []);

  // Draw the ball with neon glow
  const drawBall = useCallback((ctx: CanvasRenderingContext2D, ball: Ball) => {
    const { x, y } = ball.position;

    // Glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';

    // Main ball
    ctx.beginPath();
    ctx.arc(x, y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // Inner core
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(x, y, ball.radius * 0.6, 0, Math.PI * 2);
    ctx.fillStyle = '#e0e0ff';
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(x - 2, y - 2, ball.radius * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();
  }, []);

  // Main game loop - defined as ref to avoid circular dependency
  useEffect(() => {
    gameLoopRef.current = (timestamp: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx || !gameLoopRef.current) return;

      // Calculate delta time
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      if (!isPausedRef.current) {
        // Update paddle position
        const paddle = paddleRef.current;
        paddle.position.x = mouseXRef.current - paddle.width / 2;

        // Update ball position
        const ball = ballRef.current;
        const delta = multiply(ball.velocity, deltaTime);
        ball.position = add(ball.position, delta);

        // Check wall collisions
        const bounds: GameBounds = { width: CANVAS_WIDTH, height: CANVAS_HEIGHT };
        const wallCollision = checkBallWallCollision(ball, bounds);
        if (wallCollision.collided && wallCollision.normal) {
          if (wallCollision.wall === 'bottom') {
            // Ball fell below paddle - lose a life
            onLifeLost();
            resetBall();
          } else {
            // Reflect off walls
            ball.velocity = resolveBallCollision(ball, wallCollision).velocity;
          }
        }

        // Check paddle collision
        const paddleCollision = checkBallPaddleCollision(ball, paddle);
        if (paddleCollision.collided && paddleCollision.hitPosition !== undefined) {
          ball.velocity = calculatePaddleBounceVelocity(
            ball.speed,
            paddleCollision.hitPosition
          );
        }

        // Check brick collisions
        const brickCollision = checkAllBrickCollisions(
          ball,
          bricksRef.current,
          deltaTime
        );
        if (brickCollision.collided && brickCollision.brickId) {
          const brick = bricksRef.current.find(b => b.id === brickCollision.brickId);
          if (brick && !brick.isDestroyed) {
            brick.durability--;
            if (brick.durability <= 0) {
              brick.isDestroyed = true;
              bricksDestroyedRef.current++;
              // Award points
              onScoreAdd(BRICK_POINTS[brick.durability + 1 as 1 | 2 | 3] || 10);
              // Update progress in parent component
              onProgressUpdate(bricksDestroyedRef.current, bricksRef.current.length);
            }

            // Reflect ball
            if (brickCollision.normal) {
              ball.velocity = resolveBallCollision(ball, brickCollision).velocity;
            }

            // Check level complete
            const totalBricks = bricksRef.current.length;
            if (bricksDestroyedRef.current >= totalBricks) {
              onLevelComplete();
            }
          }
        }

        // Check if ball is out of bounds (failsafe)
        if (isBallOutOfBounds(ball.position.y, ball.radius, CANVAS_HEIGHT)) {
          onLifeLost();
          resetBall();
        }
      }

      // Clear canvas
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw grid lines (subtle background)
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.05)';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Draw bricks
      bricksRef.current.forEach(brick => drawBrick(ctx, brick));

      // Draw paddle
      drawPaddle(ctx, paddleRef.current);

      // Draw ball
      drawBall(ctx, ballRef.current);

      // Continue loop
      animationRef.current = requestAnimationFrame(gameLoopRef.current!);
    };

    // Start game loop
    animationRef.current = requestAnimationFrame(gameLoopRef.current);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [onLifeLost, onScoreAdd, onLevelComplete, onProgressUpdate, resetBall, drawBrick, drawPaddle, drawBall]);

  return (
    <>
      <style jsx>{`
        .game-canvas-container {
          position: relative;
          width: 100%;
          max-width: 800px;
          aspect-ratio: 4 / 3;
          margin: 0 auto;
          background: #0a0a14;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 0 40px rgba(0, 212, 255, 0.2);
        }

        .game-canvas {
          width: 100%;
          height: 100%;
          cursor: none;
          display: block;
        }

        @media (max-width: 832px) {
          .game-canvas-container {
            border-radius: 0;
            max-width: 100vw;
          }
        }
      `}</style>
      <div className="game-canvas-container">
        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        />
      </div>
    </>
  );
}

export default GameCanvas;
