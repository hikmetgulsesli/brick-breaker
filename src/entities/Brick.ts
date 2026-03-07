/**
 * Brick entity for the brick breaker game
 * Handles brick state, durability, colors, scoring, and rendering
 */

export type BrickDurability = 1 | 2 | 3;

export interface BrickState {
  /** X position (pixels from left) */
  x: number;
  /** Y position (pixels from top) */
  y: number;
  /** Brick width in pixels */
  width: number;
  /** Brick height in pixels */
  height: number;
  /** Current durability (hits remaining, 0 when destroyed) */
  durability: BrickDurability | 0;
  /** Whether brick is still active (not destroyed) */
  isActive: boolean;
  /** Score value when destroyed */
  scoreValue: number;
}

export interface BrickConfig {
  /** Brick width in pixels */
  width: number;
  /** Brick height in pixels */
  height: number;
  /** Brick padding in pixels */
  padding: number;
  /** Corner radius for rounded bricks */
  cornerRadius: number;
  /** Glow blur radius in pixels */
  glowBlur: number;
}

export const DEFAULT_BRICK_CONFIG: BrickConfig = {
  width: 60,
  height: 20,
  padding: 5,
  cornerRadius: 4,
  glowBlur: 12,
};

// Color definitions for each durability level (retro neon palette)
export const BRICK_COLORS: Record<BrickDurability, { fill: string; glow: string; border: string }> = {
  1: { fill: '#00ff41', glow: '#00ff41', border: '#00cc33' },      // Green neon - 1 hit
  2: { fill: '#ff9f1c', glow: '#ff9f1c', border: '#cc7a00' },      // Orange neon - 2 hits
  3: { fill: '#ff3864', glow: '#ff3864', border: '#cc0033' },      // Red/Pink neon - 3 hits
};

// Score values for each durability level
export const BRICK_SCORES: Record<BrickDurability, number> = {
  1: 10,
  2: 20,
  3: 30,
};

export interface BrickHitResult {
  /** Whether the brick was destroyed by this hit */
  destroyed: boolean;
  /** Points scored from this hit */
  points: number;
  /** Remaining durability after hit */
  remainingDurability: number;
}

export class Brick {
  private state: BrickState;
  private config: BrickConfig;
  private initialDurability: BrickDurability;

  constructor(
    x: number,
    y: number,
    durability: BrickDurability,
    config: Partial<BrickConfig> = {}
  ) {
    this.config = { ...DEFAULT_BRICK_CONFIG, ...config };
    this.initialDurability = durability;
    
    this.state = {
      x,
      y,
      width: this.config.width,
      height: this.config.height,
      durability,
      isActive: true,
      scoreValue: BRICK_SCORES[durability],
    };
  }

  /**
   * Get current brick state (immutable copy)
   */
  getState(): BrickState {
    return { ...this.state };
  }

  /**
   * Get brick configuration
   */
  getConfig(): BrickConfig {
    return { ...this.config };
  }

  /**
   * Get the initial durability (for reset)
   */
  getInitialDurability(): BrickDurability {
    return this.initialDurability;
  }

  /**
   * Check if brick is still active
   */
  isActive(): boolean {
    return this.state.isActive;
  }

  /**
   * Get current durability level
   */
  getDurability(): BrickDurability | 0 {
    return this.state.durability;
  }

  /**
   * Get the color scheme for current durability
   */
  getColors(): { fill: string; glow: string; border: string } {
    // If durability is 0 (destroyed), return durability 1 colors
    const durability = this.state.durability || 1;
    return BRICK_COLORS[durability as BrickDurability];
  }

  /**
   * Get the score value for this brick
   */
  getScoreValue(): number {
    return this.state.scoreValue;
  }

  /**
   * Get the brick's bounding box for collision detection
   */
  getBoundingBox(): { left: number; right: number; top: number; bottom: number } {
    return {
      left: this.state.x,
      right: this.state.x + this.state.width,
      top: this.state.y,
      bottom: this.state.y + this.state.height,
    };
  }

  /**
   * Check if a point is within the brick
   */
  containsPoint(x: number, y: number): boolean {
    return (
      x >= this.state.x &&
      x <= this.state.x + this.state.width &&
      y >= this.state.y &&
      y <= this.state.y + this.state.height
    );
  }

  /**
   * Handle a hit on this brick
   * Returns hit result with points and destruction status
   */
  hit(): BrickHitResult {
    if (!this.state.isActive) {
      return {
        destroyed: false,
        points: 0,
        remainingDurability: 0,
      };
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

    return {
      destroyed: false,
      points: 0,
      remainingDurability: this.state.durability as BrickDurability,
    };
  }

  /**
   * Reset brick to initial state
   */
  reset(): void {
    this.state.durability = this.initialDurability;
    this.state.isActive = true;
    this.state.scoreValue = BRICK_SCORES[this.initialDurability];
  }

  /**
   * Destroy the brick immediately (for power-ups, etc.)
   */
  destroy(): number {
    if (!this.state.isActive) return 0;
    
    const points = this.state.scoreValue;
    this.state.isActive = false;
    this.state.durability = 0;
    return points;
  }

  /**
   * Update brick dimensions (e.g., on resize)
   * Uses scale factors to maintain relative position
   */
  updateDimensions(
    newWidth: number,
    newHeight: number,
    scaleX: number,
    scaleY: number
  ): void {
    this.state.x *= scaleX;
    this.state.y *= scaleY;
    this.state.width = newWidth;
    this.state.height = newHeight;
    this.config.width = newWidth;
    this.config.height = newHeight;
  }

  /**
   * Render the brick to a canvas context
   */
  render(ctx: CanvasRenderingContext2D): void {
    if (!this.state.isActive) return;

    const { x, y, width, height } = this.state;
    const colors = this.getColors();
    const radius = this.config.cornerRadius;

    ctx.save();

    // Set glow effect
    ctx.shadowColor = colors.glow;
    ctx.shadowBlur = this.config.glowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw brick body with rounded corners
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    // Fill with brick color
    ctx.fillStyle = colors.fill;
    ctx.fill();

    // Reset shadow for border
    ctx.shadowBlur = 0;

    // Draw border
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw highlight on top edge for 3D effect
    ctx.beginPath();
    ctx.moveTo(x + radius, y + 2);
    ctx.lineTo(x + width - radius, y + 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw durability indicator (subtle dots)
    if (this.state.durability > 1) {
      this.renderDurabilityIndicator(ctx, x, y, width, height);
    }

    ctx.restore();
  }

  /**
   * Render durability indicator dots
   */
  private renderDurabilityIndicator(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number
  ): void {
    const dotSize = 3;
    const spacing = 6;
    const startX = x + width / 2 - ((this.state.durability - 1) * spacing) / 2;
    const dotY = y + height / 2;

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';

    for (let i = 0; i < this.state.durability; i++) {
      ctx.beginPath();
      ctx.arc(startX + i * spacing, dotY, dotSize, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

export default Brick;
