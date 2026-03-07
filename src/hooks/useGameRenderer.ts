'use client';

import { useEffect, useCallback } from 'react';
import type { Ball, Paddle, Brick, PowerUp, Laser, PowerUpType } from '@/types/game';
import { GAME_CONFIG, BRICK_COLORS, POWERUP_COLORS, COLORS } from '@/types/game';

interface UseGameRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  paddle: Paddle;
  balls: Ball[];
  bricks: Brick[];
  powerUps: PowerUp[];
  lasers: Laser[];
  activePowerUp: PowerUpType | null;
}

export const useGameRenderer = ({
  canvasRef,
  paddle,
  balls,
  bricks,
  powerUps,
  lasers,
  activePowerUp,
}: UseGameRendererProps) => {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.fillStyle = COLORS.BG_DARKER;
    ctx.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);
    
    // Draw grid background effect
    ctx.strokeStyle = `rgba(0, 245, 255, 0.03)`;
    ctx.lineWidth = 1;
    for (let x = 0; x < GAME_CONFIG.CANVAS_WIDTH; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GAME_CONFIG.CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y < GAME_CONFIG.CANVAS_HEIGHT; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(GAME_CONFIG.CANVAS_WIDTH, y);
      ctx.stroke();
    }
    
    // Draw bricks
    bricks.forEach(brick => {
      if (!brick.active) return;
      
      const color = BRICK_COLORS[brick.level];
      
      // Brick shadow/glow
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      
      // Brick body
      ctx.fillStyle = color;
      ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
      
      // Brick highlight
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(brick.x, brick.y, brick.width, 3);
      
      // Brick border
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
    });
    
    // Draw paddle
    ctx.shadowColor = COLORS.NEON_PINK;
    ctx.shadowBlur = activePowerUp === 'wide' ? 20 : 10;
    
    // Paddle body
    const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x, paddle.y + paddle.height);
    gradient.addColorStop(0, COLORS.NEON_PINK);
    gradient.addColorStop(0.5, '#ff4da6');
    gradient.addColorStop(1, '#cc0080');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(paddle.x, paddle.y, paddle.width, paddle.height, 4);
    ctx.fill();
    
    // Paddle highlight
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillRect(paddle.x + 4, paddle.y, paddle.width - 8, 3);
    
    // Draw laser indicators if laser power-up is active
    if (activePowerUp === 'laser') {
      ctx.shadowColor = COLORS.NEON_RED;
      ctx.shadowBlur = 8;
      ctx.fillStyle = COLORS.NEON_RED;
      ctx.fillRect(paddle.x + paddle.width * 0.25 - 2, paddle.y - 8, 4, 8);
      ctx.fillRect(paddle.x + paddle.width * 0.75 - 2, paddle.y - 8, 4, 8);
      ctx.shadowBlur = 0;
    }
    
    // Draw balls
    balls.forEach(ball => {
      if (!ball.active) return;
      
      ctx.shadowColor = COLORS.NEON_CYAN;
      ctx.shadowBlur = 15;
      
      // Ball body
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = COLORS.NEON_CYAN;
      ctx.fill();
      
      // Ball highlight
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.arc(ball.x - 2, ball.y - 2, ball.radius * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fill();
    });
    
    // Draw lasers
    lasers.forEach(laser => {
      if (!laser.active) return;
      
      ctx.shadowColor = COLORS.NEON_RED;
      ctx.shadowBlur = 10;
      ctx.fillStyle = COLORS.NEON_RED;
      ctx.fillRect(laser.x, laser.y, laser.width, laser.height);
      
      // Laser trail
      ctx.fillStyle = `rgba(255, 7, 58, 0.5)`;
      ctx.fillRect(laser.x, laser.y + laser.height, laser.width, 6);
      ctx.shadowBlur = 0;
    });
    
    // Draw power-ups
    powerUps.forEach(powerUp => {
      if (!powerUp.active) return;
      
      const color = POWERUP_COLORS[powerUp.type];
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
      
      // Power-up body
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(
        powerUp.x + powerUp.width / 2,
        powerUp.y + powerUp.height / 2,
        powerUp.width / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      
      // Power-up icon
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const iconX = powerUp.x + powerUp.width / 2;
      const iconY = powerUp.y + powerUp.height / 2;
      
      switch (powerUp.type) {
        case 'wide':
          ctx.fillRect(iconX - 6, iconY - 2, 12, 4);
          break;
        case 'multiball':
          ctx.beginPath();
          ctx.arc(iconX - 3, iconY, 2, 0, Math.PI * 2);
          ctx.arc(iconX + 3, iconY, 2, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'laser':
          ctx.fillRect(iconX - 1, iconY - 4, 2, 8);
          break;
      }
    });
    
    // Draw power-up indicator
    if (activePowerUp) {
      ctx.shadowColor = POWERUP_COLORS[activePowerUp];
      ctx.shadowBlur = 20;
      ctx.strokeStyle = POWERUP_COLORS[activePowerUp];
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(paddle.x - 4, paddle.y - 4, paddle.width + 8, paddle.height + 8, 6);
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
  }, [paddle, balls, bricks, powerUps, lasers, activePowerUp, canvasRef]);
  
  useEffect(() => {
    draw();
  }, [draw]);
};
