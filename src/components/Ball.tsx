'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Ball, { BallConfig, BallState } from '../entities/Ball';

export interface BallComponentProps {
  /** Canvas width in pixels */
  canvasWidth: number;
  /** Canvas height in pixels */
  canvasHeight: number;
  /** Paddle X position (pixels) */
  paddleX: number;
  /** Paddle width in pixels */
  paddleWidth: number;
  /** Paddle Y position (pixels) */
  paddleY: number;
  /** Whether ball should be active (launched) */
  isActive: boolean;
  /** Custom ball configuration */
  config?: Partial<BallConfig>;
  /** Optional CSS class name */
  className?: string;
  /** Callback when ball goes below paddle (life lost) */
  onLifeLost?: () => void;
  /** Delta time since last frame (seconds) */
  deltaTime: number;
}

export interface BallComponentRef {
  /** Get current ball state */
  getState: () => BallState;
  /** Get ball bounding box for collision detection */
  getBoundingBox: () => { left: number; right: number; top: number; bottom: number };
  /** Launch the ball */
  launch: () => void;
  /** Reset ball to center */
  reset: () => void;
  /** Set ball position */
  setPosition: (x: number, y: number) => void;
  /** Get current speed */
  getSpeed: () => number;
  /** Check collision with brick */
  checkBrickCollision: (left: number, right: number, top: number, bottom: number) => boolean;
}

/**
 * Ball component for rendering the game ball
 * Uses canvas rendering for optimal performance
 */
export const BallComponent = forwardRef<BallComponentRef, BallComponentProps>(
  function BallComponent(
    {
      canvasWidth,
      canvasHeight,
      paddleX,
      paddleWidth,
      paddleY,
      isActive,
      config,
      className,
      onLifeLost,
      deltaTime,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const ballRef = useRef<Ball | null>(null);
    const isActiveRef = useRef(isActive);

    // Keep ref in sync with prop
    useEffect(() => {
      isActiveRef.current = isActive;
    }, [isActive]);

    // Initialize ball instance
    useEffect(() => {
      ballRef.current = new Ball(canvasWidth, canvasHeight, config);

      if (onLifeLost) {
        ballRef.current.onLifeLost(onLifeLost);
      }
    }, [canvasWidth, canvasHeight, config, onLifeLost]);

    // Update life lost callback
    useEffect(() => {
      if (ballRef.current && onLifeLost) {
        ballRef.current.onLifeLost(onLifeLost);
      }
    }, [onLifeLost]);

    // Launch ball when isActive becomes true
    useEffect(() => {
      if (isActive && ballRef.current && !ballRef.current.getState().isActive) {
        ballRef.current.launch();
      }
    }, [isActive]);

    // Game loop update and render
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !ballRef.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Update ball if active
      if (isActiveRef.current) {
        ballRef.current.update(deltaTime, paddleX, paddleWidth, paddleY);
      }

      // Render ball
      ballRef.current.render(ctx);
    });

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      getState: () =>
        ballRef.current?.getState() ?? {
          x: canvasWidth / 2,
          y: canvasHeight / 2,
          velocityX: 0,
          velocityY: 0,
          radius: 8,
          isActive: false,
        },
      getBoundingBox: () =>
        ballRef.current?.getBoundingBox() ?? {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        },
      launch: () => ballRef.current?.launch(),
      reset: () => ballRef.current?.reset(),
      setPosition: (x: number, y: number) => ballRef.current?.setPosition(x, y),
      getSpeed: () => ballRef.current?.getSpeed() ?? 0,
      checkBrickCollision: (left: number, right: number, top: number, bottom: number) =>
        ballRef.current?.checkBrickCollision(left, right, top, bottom) ?? false,
    }), [canvasWidth, canvasHeight]);

    return (
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={className}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: canvasWidth,
          height: canvasHeight,
          pointerEvents: 'none',
        }}
      />
    );
  }
);

export default BallComponent;
