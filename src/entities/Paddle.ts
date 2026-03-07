/**
 * Paddle entity for the brick breaker game
 * Handles paddle state, position, dimensions, and rendering
 */

export type PaddleType = 'normal' | 'wide';

export interface PaddleState {
  /** X position (0 to 1, normalized) */
  x: number;
  /** Y position (pixels from top) */
  y: number;
  /** Paddle width in pixels */
  width: number;
  /** Paddle height in pixels */
  height: number;
  /** Current paddle type (normal or wide) */
  type: PaddleType;
  /** Whether paddle has laser power-up */
  hasLaser: boolean;
}

export interface PaddleConfig {
  /** Normal paddle width in pixels */
  normalWidth: number;
  /** Wide paddle width in pixels */
  wideWidth: number;
  /** Paddle height in pixels */
  height: number;
  /** Distance from bottom of canvas in pixels */
  bottomMargin: number;
  /** Neon glow color (hex) */
  glowColor: string;
  /** Wide paddle glow color (hex) */
  wideGlowColor: string;
  /** Glow blur radius in pixels */
  glowBlur: number;
  /** Wide paddle glow blur radius */
  wideGlowBlur: number;
}

export const DEFAULT_PADDLE_CONFIG: PaddleConfig = {
  normalWidth: 100,
  wideWidth: 150,
  height: 16,
  bottomMargin: 20,
  glowColor: '#00f5ff',
  wideGlowColor: '#ff00ff',
  glowBlur: 10,
  wideGlowBlur: 15,
};

export class Paddle {
  private state: PaddleState;
  private config: PaddleConfig;
  private canvasHeight: number;
  private canvasWidth: number;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    config: Partial<PaddleConfig> = {}
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.config = { ...DEFAULT_PADDLE_CONFIG, ...config };
    
    this.state = {
      x: 0.5, // Start centered
      y: this.calculateY(),
      width: this.config.normalWidth,
      height: this.config.height,
      type: 'normal',
      hasLaser: false,
    };
  }

  private calculateY(): number {
    return this.canvasHeight - this.config.bottomMargin - this.config.height;
  }

  /**
   * Get current paddle state (immutable copy)
   */
  getState(): PaddleState {
    return { ...this.state };
  }

  /**
   * Get paddle configuration
   */
  getConfig(): PaddleConfig {
    return { ...this.config };
  }

  /**
   * Update paddle X position (0-1 normalized)
   */
  setPosition(normalizedX: number): void {
    // Clamp between 0 and 1
    this.state.x = Math.max(0, Math.min(1, normalizedX));
  }

  /**
   * Get paddle X position in pixels
   */
  getPixelX(): number {
    return this.state.x * this.canvasWidth;
  }

  /**
   * Get paddle center X position in pixels
   */
  getCenterX(): number {
    return this.getPixelX();
  }

  /**
   * Get paddle left edge in pixels
   */
  getLeftEdge(): number {
    return this.getPixelX() - this.state.width / 2;
  }

  /**
   * Get paddle right edge in pixels
   */
  getRightEdge(): number {
    return this.getPixelX() + this.state.width / 2;
  }

  /**
   * Get paddle top edge in pixels
   */
  getTopEdge(): number {
    return this.state.y;
  }

  /**
   * Get paddle bottom edge in pixels
   */
  getBottomEdge(): number {
    return this.state.y + this.state.height;
  }

  /**
   * Activate wide paddle power-up
   */
  activateWide(): void {
    this.state.type = 'wide';
    this.state.width = this.config.wideWidth;
  }

  /**
   * Deactivate wide paddle (return to normal)
   */
  deactivateWide(): void {
    this.state.type = 'normal';
    this.state.width = this.config.normalWidth;
  }

  /**
   * Toggle laser power-up
   */
  setLaser(enabled: boolean): void {
    this.state.hasLaser = enabled;
  }

  /**
   * Check if a point is within the paddle
   */
  containsPoint(x: number, y: number): boolean {
    return (
      x >= this.getLeftEdge() &&
      x <= this.getRightEdge() &&
      y >= this.state.y &&
      y <= this.state.y + this.state.height
    );
  }

  /**
   * Get the paddle's bounding box for collision detection
   */
  getBoundingBox(): { left: number; right: number; top: number; bottom: number } {
    return {
      left: this.getLeftEdge(),
      right: this.getRightEdge(),
      top: this.state.y,
      bottom: this.state.y + this.state.height,
    };
  }

  /**
   * Reset paddle to center with normal width
   */
  reset(): void {
    this.state.x = 0.5;
    this.state.type = 'normal';
    this.state.width = this.config.normalWidth;
    this.state.hasLaser = false;
  }

  /**
   * Update canvas dimensions (e.g., on resize)
   */
  updateCanvasDimensions(width: number, height: number): void {
    this.canvasWidth = width;
    this.canvasHeight = height;
    this.state.y = this.calculateY();
  }

  /**
   * Get the current glow color based on paddle state
   */
  getGlowColor(): string {
    return this.state.type === 'wide' 
      ? this.config.wideGlowColor 
      : this.config.glowColor;
  }

  /**
   * Get the current glow blur based on paddle state
   */
  getGlowBlur(): number {
    return this.state.type === 'wide'
      ? this.config.wideGlowBlur
      : this.config.glowBlur;
  }

  /**
   * Render the paddle to a canvas context
   */
  render(ctx: CanvasRenderingContext2D): void {
    const centerX = this.getPixelX();
    const y = this.state.y;
    const width = this.state.width;
    const height = this.state.height;
    const halfWidth = width / 2;

    // Save context state
    ctx.save();

    // Set glow effect
    const glowColor = this.getGlowColor();
    const glowBlur = this.getGlowBlur();
    
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = glowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw paddle body with rounded corners
    const radius = height / 2;
    
    ctx.beginPath();
    ctx.moveTo(centerX - halfWidth + radius, y);
    ctx.lineTo(centerX + halfWidth - radius, y);
    ctx.quadraticCurveTo(centerX + halfWidth, y, centerX + halfWidth, y + radius);
    ctx.lineTo(centerX + halfWidth, y + height - radius);
    ctx.quadraticCurveTo(centerX + halfWidth, y + height, centerX + halfWidth - radius, y + height);
    ctx.lineTo(centerX - halfWidth + radius, y + height);
    ctx.quadraticCurveTo(centerX - halfWidth, y + height, centerX - halfWidth, y + height - radius);
    ctx.lineTo(centerX - halfWidth, y + radius);
    ctx.quadraticCurveTo(centerX - halfWidth, y, centerX - halfWidth + radius, y);
    ctx.closePath();

    // Fill gradient
    const gradient = ctx.createLinearGradient(centerX, y, centerX, y + height);
    gradient.addColorStop(0, '#00d4ff');
    gradient.addColorStop(0.5, '#00a8cc');
    gradient.addColorStop(1, '#007a99');
    
    ctx.fillStyle = gradient;
    ctx.fill();

    // Add highlight on top edge
    ctx.shadowBlur = 0; // Disable glow for highlight
    ctx.beginPath();
    ctx.moveTo(centerX - halfWidth + radius, y + 2);
    ctx.lineTo(centerX + halfWidth - radius, y + 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw laser indicators if active
    if (this.state.hasLaser) {
      this.renderLasers(ctx, centerX, y, halfWidth);
    }

    // Restore context state
    ctx.restore();
  }

  private renderLasers(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    y: number,
    halfWidth: number
  ): void {
    const laserWidth = 4;
    const laserHeight = 8;
    
    ctx.save();
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ff3333';

    // Left laser
    ctx.fillRect(centerX - halfWidth + 5, y - laserHeight + 2, laserWidth, laserHeight);
    
    // Right laser
    ctx.fillRect(centerX + halfWidth - 5 - laserWidth, y - laserHeight + 2, laserWidth, laserHeight);

    ctx.restore();
  }
}

export default Paddle;
