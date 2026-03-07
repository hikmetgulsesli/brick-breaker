'use client';

import { useState, useCallback, useRef, useEffect, useSyncExternalStore } from 'react';
import type { 
  Ball, 
  Paddle, 
  Brick, 
  PowerUp, 
  Laser, 
  GameStats,
  HighScore,
  PowerUpType 
} from '@/types/game';
import { 
  GAME_CONFIG, 
  LEVEL_PATTERNS,
  BRICK_COLORS,
  BRICK_SCORES,
  GameState
} from '@/types/game';

const INITIAL_STATS: GameStats = {
  score: 0,
  lives: GAME_CONFIG.MAX_LIVES,
  level: 1,
};

// localStorage hook using useSyncExternalStore
const useLocalStorage = (key: string, initialValue: HighScore[]): HighScore[] => {
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return initialValue;
    const item = localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item) as HighScore[];
      } catch {
        return initialValue;
      }
    }
    return initialValue;
  }, [key, initialValue]);

  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const subscribe = useCallback((callback: () => void) => {
    const handleStorage = () => callback();
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

const createInitialPaddle = (): Paddle => ({
  x: GAME_CONFIG.CANVAS_WIDTH / 2 - GAME_CONFIG.PADDLE_WIDTH / 2,
  y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET,
  width: GAME_CONFIG.PADDLE_WIDTH,
  height: GAME_CONFIG.PADDLE_HEIGHT,
  powerUpState: 'none',
  powerUpEndTime: null,
});

const createInitialBall = (): Ball => ({
  x: GAME_CONFIG.CANVAS_WIDTH / 2,
  y: GAME_CONFIG.CANVAS_HEIGHT - GAME_CONFIG.PADDLE_Y_OFFSET - 20,
  dx: GAME_CONFIG.BALL_SPEED_BASE * (Math.random() > 0.5 ? 1 : -1),
  dy: -GAME_CONFIG.BALL_SPEED_BASE,
  radius: GAME_CONFIG.BALL_RADIUS,
  active: true,
});

const createBricks = (level: number): Brick[] => {
  const pattern = LEVEL_PATTERNS[(level - 1) % LEVEL_PATTERNS.length];
  const bricks: Brick[] = [];
  
  const totalWidth = GAME_CONFIG.BRICK_COLS * GAME_CONFIG.BRICK_WIDTH + 
                     (GAME_CONFIG.BRICK_COLS - 1) * GAME_CONFIG.BRICK_GAP;
  const startX = (GAME_CONFIG.CANVAS_WIDTH - totalWidth) / 2;
  const startY = 60;
  
  for (let row = 0; row < pattern.length; row++) {
    for (let col = 0; col < pattern[row].length; col++) {
      const level = pattern[row][col];
      if (level > 0) {
        bricks.push({
          x: startX + col * (GAME_CONFIG.BRICK_WIDTH + GAME_CONFIG.BRICK_GAP),
          y: startY + row * (GAME_CONFIG.BRICK_HEIGHT + GAME_CONFIG.BRICK_GAP),
          width: GAME_CONFIG.BRICK_WIDTH,
          height: GAME_CONFIG.BRICK_HEIGHT,
          level: level as 1 | 2 | 3,
          durability: level,
          color: BRICK_COLORS[level as 1 | 2 | 3],
          scoreValue: BRICK_SCORES[level as 1 | 2 | 3],
          active: true,
        });
      }
    }
  }
  
  return bricks;
};

const getSpeedForLevel = (level: number): number => {
  const speed = GAME_CONFIG.BALL_SPEED_BASE + (level - 1) * 0.5;
  return Math.min(speed, GAME_CONFIG.BALL_SPEED_MAX);
};

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [paddle, setPaddle] = useState<Paddle>(createInitialPaddle());
  const [balls, setBalls] = useState<Ball[]>([createInitialBall()]);
  const [bricks, setBricks] = useState<Brick[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [lasers, setLasers] = useState<Laser[]>([]);
  const [activePowerUp, setActivePowerUp] = useState<PowerUpType | null>(null);
  const [powerUpTimeRemaining, setPowerUpTimeRemaining] = useState<number | null>(null);
  const highScores = useLocalStorage('brickBreakerHighScores', []);
  const [highScoresState, setHighScoresState] = useState<HighScore[]>(highScores);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const lastShotTime = useRef<number>(0);
  const powerUpTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const powerUpIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const powerUpEndTimeRef = useRef<number | null>(null);
  const canvasRectRef = useRef<DOMRect | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);
  
  // Play laser sound effect
  const playLaserSound = useCallback(() => {
    const ctx = initAudio();
    if (!ctx) return;
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  }, [initAudio]);
  
  // Sync highScores to state when loaded from localStorage
  useEffect(() => {
    setHighScoresState(highScores);
  }, [highScores]);
  
  // Cache canvas rect for performance
  useEffect(() => {
    const updateCanvasRect = () => {
      if (canvasRef.current) {
        canvasRectRef.current = canvasRef.current.getBoundingClientRect();
      }
    };
    
    updateCanvasRect();
    window.addEventListener('resize', updateCanvasRect);
    return () => window.removeEventListener('resize', updateCanvasRect);
  }, []);
  
  // Save high score
  const saveHighScore = useCallback((score: number, level: number) => {
    const newScore: HighScore = {
      score,
      date: new Date().toISOString(),
      level,
    };
    
    setHighScoresState(prev => {
      const updated = [...prev, newScore]
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
      localStorage.setItem('brickBreakerHighScores', JSON.stringify(updated));
      return updated;
    });
  }, []);
  
  // Start game
  const startGame = useCallback((level: number = 1) => {
    setStats({
      score: 0,
      lives: GAME_CONFIG.MAX_LIVES,
      level,
    });
    setPaddle(createInitialPaddle());
    setBalls([createInitialBall()]);
    setBricks(createBricks(level));
    setPowerUps([]);
    setLasers([]);
    setActivePowerUp(null);
    setGameState(GameState.PLAYING);
  }, []);
  
  // Pause/Resume
  const togglePause = useCallback(() => {
    setGameState(prev => prev === GameState.PLAYING ? GameState.PAUSED : GameState.PLAYING);
  }, []);
  
  // Return to menu
  const returnToMenu = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setGameState(GameState.MENU);
  }, []);
  
  // Update paddle position
  const updatePaddlePosition = useCallback((clientX: number) => {
    if (gameState !== 'playing' && gameState !== 'paused') return;
    
    const rect = canvasRectRef.current;
    if (!rect) return;
    
    const scaleX = GAME_CONFIG.CANVAS_WIDTH / rect.width;
    const x = (clientX - rect.left) * scaleX;
    
    setPaddle(prev => ({
      ...prev,
      x: Math.max(0, Math.min(GAME_CONFIG.CANVAS_WIDTH - prev.width, x - prev.width / 2)),
    }));
  }, [gameState]);
  
  // Shoot laser
  const shootLaser = useCallback(() => {
    if (activePowerUp !== 'laser') return;

    const now = Date.now();
    if (now - lastShotTime.current < 250) return; // Rate limit
    lastShotTime.current = now;

    // Play laser sound effect
    playLaserSound();

    setLasers(prev => [
      ...prev,
      {
        x: paddle.x + paddle.width * 0.25,
        y: paddle.y,
        width: GAME_CONFIG.LASER_WIDTH,
        height: GAME_CONFIG.LASER_HEIGHT,
        active: true,
        speed: GAME_CONFIG.LASER_SPEED,
      },
      {
        x: paddle.x + paddle.width * 0.75 - GAME_CONFIG.LASER_WIDTH,
        y: paddle.y,
        width: GAME_CONFIG.LASER_WIDTH,
        height: GAME_CONFIG.LASER_HEIGHT,
        active: true,
        speed: GAME_CONFIG.LASER_SPEED,
      },
    ]);
  }, [activePowerUp, paddle, playLaserSound]);
  
  // Spawn power-up
  const spawnPowerUp = useCallback((x: number, y: number) => {
    if (Math.random() > GAME_CONFIG.POWERUP_CHANCE) return;
    
    const types: PowerUpType[] = ['wide', 'multiball', 'laser'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    setPowerUps(prev => [
      ...prev,
      {
        x,
        y,
        type,
        active: true,
        width: 20,
        height: 20,
        dy: GAME_CONFIG.POWERUP_FALL_SPEED,
        duration: type === 'wide' ? GAME_CONFIG.WIDE_DURATION : type === 'laser' ? GAME_CONFIG.LASER_DURATION : 0,
      },
    ]);
  }, []);
  
  // Apply power-up
  const applyPowerUp = useCallback((type: PowerUpType) => {
    // First, revert any existing power-up effect
    if (activePowerUp === 'wide') {
      setPaddle(prev => ({ ...prev, width: GAME_CONFIG.PADDLE_WIDTH }));
    }

    // Clear previous power-up timeout and interval
    if (powerUpTimeoutRef.current) {
      clearTimeout(powerUpTimeoutRef.current);
      powerUpTimeoutRef.current = null;
    }
    if (powerUpIntervalRef.current) {
      clearInterval(powerUpIntervalRef.current);
      powerUpIntervalRef.current = null;
    }

    setActivePowerUp(type);

    // Determine duration once for consistency
    let duration: number | null = null;

    switch (type) {
      case 'wide':
        setPaddle(prev => ({ ...prev, width: GAME_CONFIG.PADDLE_WIDTH_WIDE }));
        duration = GAME_CONFIG.WIDE_DURATION;
        break;
      case 'multiball':
        setBalls(prev => {
          const activeBalls = prev.filter(b => b.active);
          const newBalls: Ball[] = [];
          activeBalls.forEach(ball => {
            newBalls.push(
              { ...ball, dx: ball.dx * 0.9, dy: ball.dy },
              { ...ball, dx: -ball.dx * 0.9, dy: ball.dy * 0.9 }
            );
          });
          return [...prev.filter(b => !b.active), ...activeBalls, ...newBalls];
        });
        // Multiball doesn't timeout
        setPowerUpTimeRemaining(null);
        return;
      case 'laser':
        duration = GAME_CONFIG.LASER_DURATION;
        break;
    }

    if (duration !== null) {
      powerUpEndTimeRef.current = Date.now() + duration;
      setPowerUpTimeRemaining(duration);
    }

    // Start countdown interval for timer display
    powerUpIntervalRef.current = setInterval(() => {
      const remaining = powerUpEndTimeRef.current ? Math.max(0, powerUpEndTimeRef.current - Date.now()) : 0;
      setPowerUpTimeRemaining(remaining > 0 ? remaining : null);
      if (remaining <= 0) {
        if (powerUpIntervalRef.current) {
          clearInterval(powerUpIntervalRef.current);
          powerUpIntervalRef.current = null;
        }
      }
    }, 100);

    // Power-up expires after duration (except multiball which returns early)
    if (duration !== null) {
      powerUpTimeoutRef.current = setTimeout(() => {
      setActivePowerUp(() => {
        // Only revert if this specific power-up is still active
        if (type === 'wide') {
          setPaddle(prev => ({ ...prev, width: GAME_CONFIG.PADDLE_WIDTH }));
        }
        return null;
      });
      setPowerUpTimeRemaining(null);
      if (powerUpIntervalRef.current) {
        clearInterval(powerUpIntervalRef.current);
        powerUpIntervalRef.current = null;
      }
      }, duration);
    }
  }, [activePowerUp]);
  
  // Game loop
  useEffect(() => {
    if (gameState !== 'playing') {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    const gameLoop = () => {
      setBalls(prevBalls => {
        const speed = getSpeedForLevel(stats.level);
        return prevBalls.map(ball => {
          if (!ball.active) return ball;
          
          let newX = ball.x + ball.dx;
          let newY = ball.y + ball.dy;
          let newDx = ball.dx;
          let newDy = ball.dy;
          
          // Wall collisions
          if (newX - ball.radius <= 0 || newX + ball.radius >= GAME_CONFIG.CANVAS_WIDTH) {
            newDx = -newDx;
            newX = Math.max(ball.radius, Math.min(GAME_CONFIG.CANVAS_WIDTH - ball.radius, newX));
          }
          if (newY - ball.radius <= 0) {
            newDy = -newDy;
            newY = ball.radius;
          }
          
          // Paddle collision
          if (
            newY + ball.radius >= paddle.y &&
            newY - ball.radius <= paddle.y + paddle.height &&
            newX >= paddle.x &&
            newX <= paddle.x + paddle.width &&
            newDy > 0
          ) {
            const hitPoint = (newX - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
            const angle = hitPoint * Math.PI / 3; // Max 60 degrees
            newDx = speed * Math.sin(angle);
            newDy = -speed * Math.cos(angle);
            newY = paddle.y - ball.radius;
          }
          
          // Ball out of bounds
          if (newY > GAME_CONFIG.CANVAS_HEIGHT) {
            return { ...ball, active: false };
          }
          
          return { ...ball, x: newX, y: newY, dx: newDx, dy: newDy };
        });
      });
      
      // Check for active balls
      const activeBallsCount = balls.filter(b => b.active).length;
      if (activeBallsCount === 0 && balls.length > 0) {
        setStats(prev => {
          const newLives = prev.lives - 1;
          if (newLives <= 0) {
            setGameState(GameState.GAME_OVER);
            saveHighScore(prev.score, prev.level);
          } else {
            setBalls([createInitialBall()]);
            setActivePowerUp(null);
            setPaddle(createInitialPaddle());
          }
          return { ...prev, lives: newLives };
        });
      }
      
      // Brick collisions
      setBricks(prevBricks => {
        let scoreIncrease = 0;
        const updatedBricks = prevBricks.map(brick => {
          if (!brick.active) return brick;
          
          for (const ball of balls) {
            if (!ball.active) continue;
            
            if (
              ball.x + ball.radius >= brick.x &&
              ball.x - ball.radius <= brick.x + brick.width &&
              ball.y + ball.radius >= brick.y &&
              ball.y - ball.radius <= brick.y + brick.height
            ) {
              scoreIncrease += brick.level * 10;
              
              // Bounce ball
              setBalls(prev => prev.map(b => 
                b === ball ? { ...b, dy: -b.dy } : b
              ));
              
              // Spawn power-up chance
              if (Math.random() < GAME_CONFIG.POWERUP_CHANCE) {
                spawnPowerUp(brick.x + brick.width / 2, brick.y);
              }
              
              return { ...brick, active: false };
            }
          }
          
          return brick;
        });
        
        if (scoreIncrease > 0) {
          setStats(prev => ({ ...prev, score: prev.score + scoreIncrease }));
        }
        
        // Check victory
        if (updatedBricks.every(b => !b.active)) {
          if (stats.level < 3) {
            setStats(prev => ({ ...prev, level: prev.level + 1 }));
            setBricks(createBricks(stats.level + 1));
            setBalls([createInitialBall()]);
            setActivePowerUp(null);
            setPaddle(createInitialPaddle());
          } else {
            setGameState(GameState.VICTORY);
            saveHighScore(stats.score, stats.level);
          }
        }
        
        return updatedBricks;
      });
      
      // Update power-ups
      setPowerUps(prev => prev.map(p => ({
        ...p,
        y: p.y + p.dy,
      })).filter(p => {
        if (p.y > GAME_CONFIG.CANVAS_HEIGHT) return false;
        
        // Check paddle collision
        if (
          p.active &&
          p.y + p.height >= paddle.y &&
          p.y <= paddle.y + paddle.height &&
          p.x >= paddle.x &&
          p.x <= paddle.x + paddle.width
        ) {
          applyPowerUp(p.type);
          return false;
        }
        
        return true;
      }));
      
      // Update lasers
      setLasers(prev => prev
        .map(l => ({ ...l, y: l.y - GAME_CONFIG.LASER_SPEED }))
        .filter(l => l.y > 0)
      );
      
      // Laser-brick collisions
      setBricks(prevBricks => {
        let scoreIncrease = 0;
        const updatedBricks = prevBricks.map(brick => {
          if (!brick.active) return brick;
          
          for (const laser of lasers) {
            if (!laser.active) continue;
            
            if (
              laser.x < brick.x + brick.width &&
              laser.x + laser.width > brick.x &&
              laser.y < brick.y + brick.height &&
              laser.y + laser.height > brick.y
            ) {
              scoreIncrease += brick.level * 10;
              laser.active = false;
              return { ...brick, active: false };
            }
          }
          
          return brick;
        });
        
        if (scoreIncrease > 0) {
          setStats(prev => ({ ...prev, score: prev.score + scoreIncrease }));
        }
        
        setLasers(prev => prev.filter(l => l.active));
        
        return updatedBricks;
      });
      
      animationRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, balls, paddle, bricks, lasers, stats.level, stats.score, saveHighScore, spawnPowerUp, applyPowerUp]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (powerUpTimeoutRef.current) {
        clearTimeout(powerUpTimeoutRef.current);
      }
      if (powerUpIntervalRef.current) {
        clearInterval(powerUpIntervalRef.current);
      }
    };
  }, []);
  
  return {
    gameState,
    stats,
    paddle,
    balls,
    bricks,
    powerUps,
    lasers,
    activePowerUp,
    powerUpTimeRemaining,
    highScores: highScoresState,
    canvasRef,
    startGame,
    togglePause,
    returnToMenu,
    updatePaddlePosition,
    shootLaser,
  };
};
