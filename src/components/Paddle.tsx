'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import Paddle, { PaddleConfig, PaddleType, PaddleState } from '../entities/Paddle';

export interface PaddleComponentProps {
  /** Canvas width in pixels */
  canvasWidth: number;
  /** Canvas height in pixels */
  canvasHeight: number;
  /** Normalized paddle X position (0-1) */
  paddleX: number;
  /** Current paddle type */
  paddleType?: PaddleType;
  /** Whether laser power-up is active */
  hasLaser?: boolean;
  /** Custom paddle configuration */
  config?: Partial<PaddleConfig>;
  /** Optional CSS class name */
  className?: string;
}

export interface PaddleComponentRef {
  /** Get current paddle state */
  getState: () => PaddleState;
  /** Get paddle bounding box for collision detection */
  getBoundingBox: () => { left: number; right: number; top: number; bottom: number };
  /** Check if point is within paddle */
  containsPoint: (x: number, y: number) => boolean;
  /** Activate wide paddle */
  activateWide: () => void;
  /** Deactivate wide paddle */
  deactivateWide: () => void;
  /** Set laser state */
  setLaser: (enabled: boolean) => void;
  /** Reset paddle to center */
  reset: () => void;
}

/**
 * Paddle component for rendering the game paddle
 * Uses canvas rendering for optimal performance
 */
export const PaddleComponent = forwardRef<PaddleComponentRef, PaddleComponentProps>(
  function PaddleComponent(
    {
      canvasWidth,
      canvasHeight,
      paddleX,
      paddleType = 'normal',
      hasLaser = false,
      config,
      className,
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const paddleRef = useRef<Paddle | null>(null);

    // Initialize paddle instance
    useEffect(() => {
      paddleRef.current = new Paddle(canvasWidth, canvasHeight, config);
    }, [canvasWidth, canvasHeight, config]);

    // Update paddle position and state
    useEffect(() => {
      if (!paddleRef.current) return;

      // Update position
      paddleRef.current.setPosition(paddleX);

      // Update type
      if (paddleType === 'wide') {
        paddleRef.current.activateWide();
      } else {
        paddleRef.current.deactivateWide();
      }

      // Update laser state
      paddleRef.current.setLaser(hasLaser);

      // Update canvas dimensions if changed
      paddleRef.current.updateCanvasDimensions(canvasWidth, canvasHeight);
    }, [paddleX, paddleType, hasLaser, canvasWidth, canvasHeight]);

    // Render paddle to canvas
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !paddleRef.current) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      // Render paddle
      paddleRef.current.render(ctx);
    });

    // Expose imperative handle
    useImperativeHandle(ref, () => ({
      getState: () => paddleRef.current?.getState() ?? {
        x: 0.5,
        y: canvasHeight - (config?.bottomMargin ?? 20) - (config?.height ?? 16),
        width: config?.normalWidth ?? 100,
        height: config?.height ?? 16,
        type: 'normal',
        hasLaser: false,
      },
      getBoundingBox: () => paddleRef.current?.getBoundingBox() ?? {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
      containsPoint: (x: number, y: number) =>
        paddleRef.current?.containsPoint(x, y) ?? false,
      activateWide: () => paddleRef.current?.activateWide(),
      deactivateWide: () => paddleRef.current?.deactivateWide(),
      setLaser: (enabled: boolean) => paddleRef.current?.setLaser(enabled),
      reset: () => paddleRef.current?.reset(),
    }), [canvasHeight, config]);

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
          pointerEvents: 'none', // Let clicks pass through to container
        }}
      />
    );
  }
);

export default PaddleComponent;
