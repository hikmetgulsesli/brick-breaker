'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// Local types for GameCanvas (simpler version for this component)
interface LocalBall {
  x: number;
  y: number;
  dx: number;
  dy: number;
  radius: number;
  speed: number;
}

interface LocalPaddle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface LocalBrick {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  visible: boolean;
}

type LocalPowerUpType = 'expand' | 'multi' | 'laser';

interface LocalPowerUp {
  x: number;
  y: number;
  type: LocalPowerUpType;
  active: boolean;
  duration: number;
}

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onVictory: (score: number) => void;
  onPause: () => void;
  isPaused: boolean;
  score: number;
  setScore: (score: number) => void;
  level: number;
  lives: number;
  setLives: (lives: number) => void;
}

// Game constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 8;
const BRICK_ROWS = 5;
const BRICK_COLS = 10;
const BRICK_WIDTH = 70;
const BRICK_HEIGHT = 20;
const BRICK_PADDING = 5;
const BRICK_OFFSET_TOP = 80;
const BRICK_OFFSET_LEFT = 35;

const BRICK_COLORS = [
  { color: '#ef4444', points: 50 },   // Red
  { color: '#f97316', points: 40 },   // Orange
  { color: '#eab308', points: 30 },   // Yellow
  { color: '#22c55e', points: 20 },   // Green
  { color: '#3b82f6', points: 10 },   // Blue
];

export function GameCanvas({ 
  onGameOver, 
  onVictory, 
  onPause, 
  isPaused, 
  score, 
  setScore, 
  level, 
  lives, 
  setLives 
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const paddleRef = useRef<LocalPaddle>({
    x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2,
    y: CANVAS_HEIGHT - 40,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });
  const ballRef = useRef<LocalBall>({
    x: CANVAS_WIDTH / 2,
    y: CANVAS_HEIGHT - 60,
    dx: 4,
    dy: -4,
    radius: BALL_RADIUS,
    speed: 5,
  });
  const bricksRef = useRef<LocalBrick[]>([]);
  const powerUpsRef = useRef<LocalPowerUp[]>([]);
  const scoreRef = useRef(score);
  const livesRef = useRef(lives);
  const [isReady, setIsReady] = useState(false);

  // Keep refs in sync with props
  useEffect(() => { scoreRef.current = score; }, [score]);
  useEffect(() => { livesRef.current = lives; }, [lives]);

  // Initialize bricks
  const initBricks = useCallback(() => {
    const bricks: LocalBrick[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        bricks.push({
          x: BRICK_OFFSET_LEFT + col * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + row * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          color: BRICK_COLORS[row].color,
          points: BRICK_COLORS[row].points,
          visible: true,
        });
      }
    }
    bricksRef.current = bricks;
  }, []);

  // Reset ball position
  const resetBall = useCallback(() => {
    ballRef.current = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 60,
      dx: 4 * (Math.random() > 0.5 ? 1 : -1),
      dy: -4,
      radius: BALL_RADIUS,
      speed: 5 + level * 0.5,
    };
  }, [level]);

  // Initialize game
  useEffect(() => {
    initBricks();
    resetBall();
    setIsReady(true);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle mouse/touch movement
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const x = (e.clientX - rect.left) * scaleX;
      paddleRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - paddleRef.current.width, x - paddleRef.current.width / 2));
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const scaleX = CANVAS_WIDTH / rect.width;
      const x = (e.touches[0].clientX - rect.left) * scaleX;
      paddleRef.current.x = Math.max(0, Math.min(CANVAS_WIDTH - paddleRef.current.width, x - paddleRef.current.width / 2));
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  // Check collision between ball and brick
  const checkBrickCollision = useCallback((ball: LocalBall, brick: LocalBrick): boolean => {
    return ball.x + ball.radius > brick.x &&
           ball.x - ball.radius < brick.x + brick.width &&
           ball.y + ball.radius > brick.y &&
           ball.y - ball.radius < brick.y + brick.height;
  }, []);

  // Spawn power-up
  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() < 0.15) { // 15% chance
      const types: LocalPowerUpType[] = ['expand', 'multi', 'laser'];
      const type = types[Math.floor(Math.random() * types.length)];
      powerUpsRef.current.push({
        x,
        y,
        type,
        active: true,
        duration: 10000, // 10 seconds
      });
    }
  }, []);

  // Game loop
  useEffect(() => {
    if (!isReady || isPaused) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const gameLoop = () => {

      // Clear canvas
      ctx.fillStyle = '#111827';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw border glow
      ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Draw bricks
      let visibleBricks = 0;
      bricksRef.current.forEach(brick => {
        if (brick.visible) {
          visibleBricks++;
          ctx.fillStyle = brick.color;
          ctx.shadowColor = brick.color;
          ctx.shadowBlur = 10;
          ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
          ctx.shadowBlur = 0;

          // Brick border
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
        }
      });

      // Check victory
      if (visibleBricks === 0) {
        onVictory(scoreRef.current);
        return;
      }

      // Update and draw ball
      const ball = ballRef.current;
      ball.x += ball.dx;
      ball.y += ball.dy;

      // Wall collisions
      if (ball.x + ball.radius > CANVAS_WIDTH || ball.x - ball.radius < 0) {
        ball.dx = -ball.dx;
      }
      if (ball.y - ball.radius < 0) {
        ball.dy = -ball.dy;
      }

      // Paddle collision
      const paddle = paddleRef.current;
      if (ball.y + ball.radius > paddle.y &&
          ball.y - ball.radius < paddle.y + paddle.height &&
          ball.x > paddle.x &&
          ball.x < paddle.x + paddle.width) {
        // Calculate angle based on where ball hit paddle
        const hitPoint = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
        const angle = hitPoint * (Math.PI / 3); // Max 60 degrees
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        ball.dx = speed * Math.sin(angle);
        ball.dy = -Math.abs(speed * Math.cos(angle));
      }

      // Brick collisions
      bricksRef.current.forEach(brick => {
        if (brick.visible && checkBrickCollision(ball, brick)) {
          brick.visible = false;
          ball.dy = -ball.dy;
          scoreRef.current += brick.points;
          setScore(scoreRef.current);
          spawnPowerUp(brick.x + brick.width / 2, brick.y + brick.height / 2);
        }
      });

      // Ball falls below paddle
      if (ball.y - ball.radius > CANVAS_HEIGHT) {
        const newLives = livesRef.current - 1;
        setLives(newLives);
        livesRef.current = newLives;
        if (newLives <= 0) {
          onGameOver(scoreRef.current);
          return;
        } else {
          resetBall();
        }
      }

      // Draw ball with glow
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#fff';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.closePath();

      // Draw paddle with glow
      ctx.fillStyle = '#22d3ee';
      ctx.shadowColor = '#22d3ee';
      ctx.shadowBlur = 15;
      ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
      ctx.shadowBlur = 0;

      // Update and draw power-ups
      powerUpsRef.current = powerUpsRef.current.filter(pu => {
        if (!pu.active) return false;
        
        pu.y += 2;
        
        // Check if power-up caught
        if (pu.y + 15 > paddle.y &&
            pu.y < paddle.y + paddle.height &&
            pu.x > paddle.x &&
            pu.x < paddle.x + paddle.width) {
          // Apply power-up effect
          switch (pu.type) {
            case 'expand':
              paddle.width = Math.min(200, paddle.width + 40);
              break;
            case 'multi':
              // Simplified: just add points for now
              setScore(scoreRef.current + 100);
              scoreRef.current += 100;
              break;
            case 'laser':
              // Simplified: just add points for now
              setScore(scoreRef.current + 50);
              scoreRef.current += 50;
              break;
          }
          return false;
        }
        
        // Draw power-up
        const colors: Record<LocalPowerUpType, string> = {
          expand: '#22c55e',
          multi: '#f97316',
          laser: '#ef4444',
        };
        ctx.fillStyle = colors[pu.type];
        ctx.beginPath();
        ctx.arc(pu.x, pu.y, 8, 0, Math.PI * 2);
        ctx.fill();
        
        return pu.y < CANVAS_HEIGHT;
      });

      animationRef.current = requestAnimationFrame(() => gameLoop());
    };

    animationRef.current = requestAnimationFrame(() => gameLoop());

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isReady, isPaused, setScore, setLives, onGameOver, onVictory, checkBrickCollision, resetBall, spawnPowerUp]);

  return (
    <div className="flex flex-col items-center">
      {/* HUD */}
      <div className="flex justify-between w-full max-w-[800px] mb-4 px-4">
        <div className="text-cyan-400 font-mono text-lg">
          SCORE: <span className="text-white" style={{ fontVariantNumeric: 'tabular-nums' }}>{score.toLocaleString()}</span>
        </div>
        <div className="flex gap-8">
          <div className="text-fuchsia-400 font-mono text-lg">
            LEVEL: <span className="text-white">{level}</span>
          </div>
          <div className="text-yellow-400 font-mono text-lg">
            LIVES: <span className="text-white">{'❤️'.repeat(lives)}</span>
          </div>
        </div>
      </div>

      {/* Game Canvas */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-cyan-400/50 rounded shadow-[0_0_30px_rgba(34,211,238,0.3)] max-w-full h-auto cursor-none"
          onClick={onPause}
          aria-label="Game canvas - click to pause"
        />
        
        {/* Pause indicator */}
        {isPaused && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <p className="text-4xl font-bold text-white tracking-wider">PAUSED</p>
          </div>
        )}
      </div>

      {/* Controls hint */}
      <p className="text-gray-500 text-sm mt-4">
        Click or press ESC to pause
      </p>
    </div>
  );
}
