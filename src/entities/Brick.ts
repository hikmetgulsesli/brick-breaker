/**
 * Brick entity types and constants
 */

import type { BrickDurability } from './types';

/** Color scheme for bricks based on durability */
export const BRICK_COLORS: Record<
  BrickDurability,
  { fill: string; glow: string; border: string }
> = {
  1: {
    fill: '#00ff41',
    glow: 'rgba(0, 255, 65, 0.6)',
    border: '#00cc33',
  },
  2: {
    fill: '#ff9f1c',
    glow: 'rgba(255, 159, 28, 0.6)',
    border: '#cc7f16',
  },
  3: {
    fill: '#ff3864',
    glow: 'rgba(255, 56, 100, 0.6)',
    border: '#cc2d50',
  },
};

/** Default brick dimensions */
export const BRICK_WIDTH = 60;
export const BRICK_HEIGHT = 24;
export const BRICK_PADDING = 4;

export interface BrickConfig {
  width: number;
  height: number;
  colors: { fill: string; glow: string; border: string };
}

export interface BrickState {
  x: number;
  y: number;
  width: number;
  height: number;
  durability: 1 | 2 | 3;
  isActive: boolean;
  scoreValue: number;
}

export interface BrickHitResult {
  destroyed: boolean;
  points: number;
  remainingDurability: number;
}

export class Brick {
  private state: BrickState;
  private config: BrickConfig;
  private initialDurability: 1 | 2 | 3;

  constructor(
    x: number,
    y: number,
    durability: 1 | 2 | 3,
    config?: Partial<BrickConfig>
  ) {
    this.initialDurability = durability;
    this.config = {
      width: config?.width ?? BRICK_WIDTH,
      height: config?.height ?? BRICK_HEIGHT,
      colors: config?.colors ?? BRICK_COLORS[durability],
    };

    this.state = {
      x,
      y,
      width: this.config.width,
      height: this.config.height,
      durability,
      isActive: true,
      scoreValue: durability * 10,
    };
  }

  getState(): BrickState {
    return { ...this.state };
  }

  getBoundingBox() {
    return {
      left: this.state.x,
      right: this.state.x + this.state.width,
      top: this.state.y,
      bottom: this.state.y + this.state.height,
    };
  }

  containsPoint(x: number, y: number): boolean {
    const { left, right, top, bottom } = this.getBoundingBox();
    return x >= left && x <= right && y >= top && y <= bottom;
  }

  hit(): BrickHitResult {
    if (!this.state.isActive) {
      return { destroyed: false, points: 0, remainingDurability: 0 };
    }

    this.state.durability--;

    if (this.state.durability <= 0) {
      this.state.isActive = false;
      return {
        destroyed: true,
        points: this.state.scoreValue,
        remainingDurability: 0,
      };
    }

    // Update colors based on new durability
    this.config.colors = BRICK_COLORS[this.state.durability as 1 | 2 | 3];

    return {
      destroyed: false,
      points: 0,
      remainingDurability: this.state.durability,
    };
  }

  getDurability(): number {
    return this.state.durability;
  }

  isActive(): boolean {
    return this.state.isActive;
  }

  getScoreValue(): number {
    return this.state.scoreValue;
  }

  reset(): void {
    this.state.durability = this.initialDurability;
    this.state.isActive = true;
    this.config.colors = BRICK_COLORS[this.initialDurability];
  }

  destroy(): number {
    const points = this.state.scoreValue;
    this.state.isActive = false;
    this.state.durability = 1; // Keep at minimum for type safety
    return points;
  }

  getColors() {
    return { ...this.config.colors };
  }

  render(ctx: CanvasRenderingContext2D): void {
    if (!this.state.isActive) return;

    const { x, y, width, height } = this.state;
    const { fill, glow, border } = this.config.colors;

    ctx.save();

    // Set glow effect
    ctx.shadowColor = glow;
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw brick fill
    ctx.fillStyle = fill;
    ctx.fillRect(x, y, width, height);

    // Draw border
    ctx.shadowBlur = 0;
    ctx.strokeStyle = border;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);

    // Add highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(x, y, width, height / 2);

    ctx.restore();
  }
}

export default Brick;
