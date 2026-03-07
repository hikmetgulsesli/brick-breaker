'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle, useState, useCallback } from 'react';
import Brick from '../entities/Brick';
import { createBricksForLevel, BrickConfig } from '../entities';

export interface BricksComponentProps {
  /** Current level number (1-3) */
  levelNumber: number;
  /** Canvas width in pixels */
  canvasWidth: number;
  /** Canvas height in pixels */
  canvasHeight: number;
  /** Optional brick configuration overrides */
  config?: Partial<BrickConfig>;
  /** Optional CSS class name */
  className?: string;
  /** Callback when a brick is destroyed */
  onBrickDestroyed?: (points: number, brickIndex: number) => void;
  /** Callback when all bricks are destroyed */
  onLevelComplete?: () => void;
}

export interface BricksComponentRef {
  /** Get all bricks */
  getBricks: () => Brick[];
  /** Get active brick count */
  getActiveCount: () => number;
  /** Get total brick count */
  getTotalCount: () => number;
  /** Check collision with ball at position */
  checkCollision: (x: number, y: number, radius: number) => { hit: boolean; points: number };
  /** Reset all bricks */
  reset: () => void;
  /** Get remaining bricks count */
  getRemainingCount: () => number;
  /** Check if level is complete */
  isLevelComplete: () => boolean;
}

/**
 * Bricks component for rendering all bricks in a level
 * Manages the collection of Brick entities for a level
 */
export const BricksComponent = forwardRef<BricksComponentRef, BricksComponentProps>(
  function BricksComponent(
    {
      levelNumber,
      canvasWidth,
      canvasHeight,
      config,
      className,
      onBrickDestroyed,
      onLevelComplete,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const bricksRef = useRef<Brick[]>([]);
    const [renderVersion, setRenderVersion] = useState(0);

    // Initialize bricks for the level
    useEffect(() => {
      try {
        bricksRef.current = createBricksForLevel(levelNumber, canvasWidth, canvasHeight, config);
      } catch (error) {
        console.error('Failed to create bricks for level:', error);
        bricksRef.current = [];
      }
    }, [levelNumber, canvasWidth, canvasHeight, config]);

    // Render all bricks to canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Render all active bricks
      bricksRef.current.forEach(brick => {
        brick.render(ctx);
      });
    }, [canvasWidth, canvasHeight, renderVersion]);

    // Trigger re-render when brick states change
    const triggerRender = useCallback(() => {
      setRenderVersion(v => v + 1);
    }, []);

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      getBricks: () => bricksRef.current,
      
      getActiveCount: () => {
        return bricksRef.current.filter(b => b.isActive()).length;
      },
      
      getTotalCount: () => bricksRef.current.length,
      
      getRemainingCount: () => {
        return bricksRef.current.filter(b => b.isActive()).length;
      },
      
      isLevelComplete: () => {
        return bricksRef.current.every(b => !b.isActive());
      },
      
      checkCollision: (x: number, y: number, radius: number) => {
        for (let i = 0; i < bricksRef.current.length; i++) {
          const brick = bricksRef.current[i];
          
          if (!brick.isActive()) continue;
          
          const bbox = brick.getBoundingBox();
          
          // Find closest point on brick to ball center
          const closestX = Math.max(bbox.left, Math.min(x, bbox.right));
          const closestY = Math.max(bbox.top, Math.min(y, bbox.bottom));
          
          // Calculate distance
          const distanceX = x - closestX;
          const distanceY = y - closestY;
          const distanceSquared = distanceX * distanceX + distanceY * distanceY;
          
          if (distanceSquared < radius * radius) {
            // Collision detected
            const result = brick.hit();
            
            // Trigger re-render to show updated brick state
            triggerRender();
            
            if (result.destroyed && onBrickDestroyed) {
              onBrickDestroyed(result.points, i);
            }
            
            // Check if level is now complete
            if (onLevelComplete) {
              const remaining = bricksRef.current.filter(b => b.isActive()).length;
              if (remaining === 0) {
                onLevelComplete();
              }
            }
            
            return { hit: true, points: result.points };
          }
        }
        
        return { hit: false, points: 0 };
      },
      
      reset: () => {
        bricksRef.current.forEach(brick => brick.reset());
      },
    }), [onBrickDestroyed, onLevelComplete, triggerRender]);

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

export default BricksComponent;
