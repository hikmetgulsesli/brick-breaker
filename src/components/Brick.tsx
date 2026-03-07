'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Brick, { BrickConfig, BrickState, BrickHitResult } from '../entities/Brick';

export interface BrickComponentProps {
  /** Brick X position (pixels from left) */
  x: number;
  /** Brick Y position (pixels from top) */
  y: number;
  /** Brick durability (1-3) */
  durability: 1 | 2 | 3;
  /** Whether brick is initially active */
  isActive?: boolean;
  /** Custom brick configuration */
  config?: Partial<BrickConfig>;
  /** Optional CSS class name */
  className?: string;
  /** Canvas width in pixels */
  canvasWidth: number;
  /** Canvas height in pixels */
  canvasHeight: number;
}

export interface BrickComponentRef {
  /** Get current brick state */
  getState: () => BrickState;
  /** Get brick bounding box for collision detection */
  getBoundingBox: () => { left: number; right: number; top: number; bottom: number };
  /** Check if a point is within the brick */
  containsPoint: (x: number, y: number) => boolean;
  /** Handle a hit on this brick */
  hit: () => BrickHitResult;
  /** Get current durability */
  getDurability: () => number;
  /** Check if brick is active */
  isActive: () => boolean;
  /** Get score value */
  getScoreValue: () => number;
  /** Reset brick to initial state */
  reset: () => void;
  /** Destroy brick immediately */
  destroy: () => number;
  /** Get current colors */
  getColors: () => { fill: string; glow: string; border: string };
}

/**
 * Brick component for rendering a single brick
 * Uses canvas rendering for optimal performance with glow effects
 */
export const BrickComponent = forwardRef<BrickComponentRef, BrickComponentProps>(
  function BrickComponent(
    {
      x,
      y,
      durability,
      isActive = true,
      config,
      className,
      canvasWidth,
      canvasHeight,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const brickRef = useRef<Brick | null>(null);

    // Initialize brick instance
    useEffect(() => {
      brickRef.current = new Brick(x, y, durability, config);
      
      // Set initial active state if false
      if (!isActive && brickRef.current) {
        brickRef.current.destroy();
      }
    }, [x, y, durability, config, isActive]);

    // Render brick to canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !brickRef.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Render brick
      brickRef.current.render(ctx);
    });

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      getState: () =>
        brickRef.current?.getState() ?? {
          x,
          y,
          width: 60,
          height: 20,
          durability: durability as 1 | 2 | 3,
          isActive,
          scoreValue: durability * 10,
        },
      getBoundingBox: () =>
        brickRef.current?.getBoundingBox() ?? {
          left: x,
          right: x + 60,
          top: y,
          bottom: y + 20,
        },
      containsPoint: (px: number, py: number) =>
        brickRef.current?.containsPoint(px, py) ?? false,
      hit: () =>
        brickRef.current?.hit() ?? {
          destroyed: false,
          points: 0,
          remainingDurability: 0,
        },
      getDurability: () => brickRef.current?.getDurability() ?? 0,
      isActive: () => brickRef.current?.isActive() ?? false,
      getScoreValue: () => brickRef.current?.getScoreValue() ?? 0,
      reset: () => brickRef.current?.reset(),
      destroy: () => brickRef.current?.destroy() ?? 0,
      getColors: () =>
        brickRef.current?.getColors() ?? {
          fill: '#00ff41',
          glow: '#00ff41',
          border: '#00cc33',
        },
    }), [x, y, durability, isActive]);

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

export default BrickComponent;
