/**
 * Ball entity for the brick breaker game
 * Handles ball physics, movement, collisions, and trail effects
 */

export interface BallState {
  /** X position (pixels from left) */
  x: number;
  /** Y position (pixels from top) */
  y: number;
  /** Velocity X component (pixels per frame) */
  velocityX: number;
  /** Velocity Y component (pixels per frame) */
  velocityY: number;
  /** Ball radius in pixels */
  radius: number;
  /** Whether ball is currently active */
  isActive: boolean;
}

export interface BallConfig {
  /** Ball radius in pixels */
  radius: number;
  /** Initial speed (pixels per frame) */
  initialSpeed: number;
  /** Minimum speed cap (pixels per frame) */
  minSpeed: number;
  /** Maximum speed cap (pixels per frame) */
  maxSpeed: number;
  /** Speed increase percentage per interval (0.02 = 2%) */
  speedIncreaseRate: number;
  /** Speed increase interval in seconds */
  speedIncreaseInterval: number;
  /** Maximum paddle bounce angle in degrees (70°) */
  maxBounceAngle: number;
  /** Neon glow color (hex) */
  glowColor: string;
  /** Glow blur radius in pixels */
  glowBlur: number;
  /** Trail length (number of positions to keep) */
  trailLength: number;
  /** Trail fade opacity */
  trailOpacity: number;
}

export const DEFAULT_BALL_CONFIG: BallConfig = {
  radius: 8,
  initialSpeed: 6,
  minSpeed: 4,
  maxSpeed: 12,
  speedIncreaseRate: 0.02,
  speedIncreaseInterval: 10,
  maxBounceAngle: 70,
  glowColor: '#ffff00',
  glowBlur: 15,
  trailLength: 8,
  trailOpacity: 0.4,
};

export interface TrailPoint {
  x: number;
  y: number;
  opacity: number;
}

export interface PaddleCollisionResult {
  /** Whether a collision occurred */
  hit: boolean;
  /** New velocity after bounce */
  newVelocityX: number;
  /** New velocity after bounce */
  newVelocityY: number;
}

export class Ball {
  private state: BallState;
  private config: BallConfig;
  private canvasWidth: number;
  private canvasHeight: number;
  private trail: TrailPoint[] = [];
  private speedMultiplier: number = 1;
  private lastSpeedIncrease: number = 0;
  private onLifeLostCallback: (() => void) | null = null;

  constructor(
    canvasWidth: number,
    canvasHeight: number,
    config: Partial<BallConfig> = {}
  ) {
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.config = { ...DEFAULT_BALL_CONFIG, ...config };

    this.state = {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      velocityX: 0,
      velocityY: 0,
      radius: this.config.radius,
      isActive: false,
    };
  }

  /**
   * Get current ball state (immutable copy)
   */
  getState(): BallState {
    return { ...this.state };
  }

  /**
   * Get ball configuration
   */
  getConfig(): BallConfig {
    return { ...this.config };
  }

  /**
   * Get current trail points
   */
  getTrail(): TrailPoint[] {
    return [...this.trail];
  }

  /**
   * Set callback for when ball goes below paddle (life lost)
   */
  onLifeLost(callback: () => void): void {
    this.onLifeLostCallback = callback;
  }

  /**
   * Launch the ball with initial velocity
   */
  launch(): void {
    if (this.state.isActive) return;

    // Launch upward at a slight random angle
    const angle = (Math.random() - 0.5) * Math.PI / 3; // +/- 30 degrees
    const speed = this.config.initialSpeed;

    this.state.velocityX = speed * Math.sin(angle);
    this.state.velocityY = -speed * Math.cos(angle);
    this.state.isActive = true;

    // Reset speed multiplier
    this.speedMultiplier = 1;
    this.lastSpeedIncrease = performance.now();
  }

  /**
   * Reset ball to center (not active)
   */
  reset(): void {
    this.state.x = this.canvasWidth / 2;
    this.state.y = this.canvasHeight / 2;
    this.state.velocityX = 0;
    this.state.velocityY = 0;
    this.state.isActive = false;
    this.trail = [];
    this.speedMultiplier = 1;
  }

  /**
   * Set ball position (useful for positioning before launch)
   */
  setPosition(x: number, y: number): void {
    this.state.x = x;
    this.state.y = y;
  }

  /**
   * Set ball velocity (useful for testing)
   */
  setVelocity(velocityX: number, velocityY: number): void {
    this.state.velocityX = velocityX;
    this.state.velocityY = velocityY;
  }

  /** Tolerance for paddle collision detection in pixels */
  private static readonly PADDLE_COLLISION_TOLERANCE = 10;

  /**
   * Update ball position and handle collisions
   * Returns true if life was lost
   */
  update(deltaTime: number, paddleX: number, paddleWidth: number, paddleY: number): boolean {
    if (!this.state.isActive) return false;

    let lifeLost = false;

    // Apply speed increase over time
    this.applySpeedIncrease();

    // Update position based on velocity
    // Cap deltaTime to prevent huge jumps when tab is in background (max ~33ms = 30fps)
    const cappedDelta = Math.min(deltaTime, 1 / 30);
    const adjustedDelta = cappedDelta * 60; // Normalize to ~60fps
    this.state.x += this.state.velocityX * adjustedDelta;
    this.state.y += this.state.velocityY * adjustedDelta;

    // Update trail
    this.updateTrail();

    // Wall collisions
    this.handleWallCollisions();

    // Paddle collision
    this.handlePaddleCollision(paddleX, paddleWidth, paddleY);

    // Check if ball went below paddle
    if (this.state.y > this.canvasHeight + this.state.radius) {
      lifeLost = true;
      this.state.isActive = false;
      if (this.onLifeLostCallback) {
        this.onLifeLostCallback();
      }
    }

    return lifeLost;
  }

  /**
   * Apply gradual speed increase
   */
  private applySpeedIncrease(): void {
    const now = performance.now();
    const elapsed = (now - this.lastSpeedIncrease) / 1000; // seconds

    if (elapsed >= this.config.speedIncreaseInterval) {
      this.speedMultiplier *= (1 + this.config.speedIncreaseRate);
      this.lastSpeedIncrease = now;

      // Apply speed multiplier while respecting caps
      this.applySpeedCaps();
    }
  }

  /**
   * Apply speed caps to current velocity
   */
  private applySpeedCaps(): void {
    const currentSpeed = Math.sqrt(
      this.state.velocityX ** 2 + this.state.velocityY ** 2
    );

    let targetSpeed = currentSpeed * this.speedMultiplier;
    targetSpeed = Math.max(
      this.config.minSpeed,
      Math.min(this.config.maxSpeed, targetSpeed)
    );

    if (currentSpeed > 0) {
      const ratio = targetSpeed / currentSpeed;
      this.state.velocityX *= ratio;
      this.state.velocityY *= ratio;
    }
  }

  /**
   * Ensure velocity respects speed caps
   */
  private clampVelocity(): void {
    const speed = Math.sqrt(
      this.state.velocityX ** 2 + this.state.velocityY ** 2
    );

    if (speed < this.config.minSpeed) {
      const ratio = this.config.minSpeed / speed;
      this.state.velocityX *= ratio;
      this.state.velocityY *= ratio;
    } else if (speed > this.config.maxSpeed) {
      const ratio = this.config.maxSpeed / speed;
      this.state.velocityX *= ratio;
      this.state.velocityY *= ratio;
    }
  }

  /**
   * Handle wall bounces (left, right, top)
   */
  private handleWallCollisions(): void {
    const { radius } = this.state;

    // Left wall
    if (this.state.x - radius < 0) {
      this.state.x = radius;
      this.state.velocityX = Math.abs(this.state.velocityX);
    }

    // Right wall
    if (this.state.x + radius > this.canvasWidth) {
      this.state.x = this.canvasWidth - radius;
      this.state.velocityX = -Math.abs(this.state.velocityX);
    }

    // Top wall
    if (this.state.y - radius < 0) {
      this.state.y = radius;
      this.state.velocityY = Math.abs(this.state.velocityY);
    }
  }

  /**
   * Handle paddle collision with angle physics
   * Center hit = straight up (0°), edge hits up to maxBounceAngle
   */
  private handlePaddleCollision(
    paddleX: number,
    paddleWidth: number,
    paddleY: number
  ): void {
    const paddleHalfWidth = paddleWidth / 2;
    const paddleLeft = paddleX - paddleHalfWidth;
    const paddleRight = paddleX + paddleHalfWidth;
    const paddleTop = paddleY;

    // Check if ball is within paddle X range and at paddle Y level
    if (
      this.state.x >= paddleLeft &&
      this.state.x <= paddleRight &&
      this.state.y + this.state.radius >= paddleTop &&
      this.state.y - this.state.radius <= paddleTop + Ball.PADDLE_COLLISION_TOLERANCE && // Tolerance for collision detection
      this.state.velocityY > 0 // Ball must be moving downward
    ) {
      // Calculate hit position relative to paddle center (-1 to 1)
      const hitPosition = (this.state.x - paddleX) / paddleHalfWidth;

      // Clamp hit position to [-1, 1]
      const clampedHitPosition = Math.max(-1, Math.min(1, hitPosition));

      // Calculate bounce angle (in radians)
      // Center (0) = straight up, edges (-1, 1) = max angle
      const maxAngleRad = (this.config.maxBounceAngle * Math.PI) / 180;
      const bounceAngle = clampedHitPosition * maxAngleRad;

      // Get current speed (maintain it)
      const currentSpeed = Math.sqrt(
        this.state.velocityX ** 2 + this.state.velocityY ** 2
      );

      // Apply new velocity based on bounce angle
      this.state.velocityX = currentSpeed * Math.sin(bounceAngle);
      this.state.velocityY = -currentSpeed * Math.cos(bounceAngle);

      // Ensure ball is above paddle
      this.state.y = paddleTop - this.state.radius;

      // Ensure speed is within caps
      this.clampVelocity();
    }
  }

  /**
   * Update trail positions
   */
  private updateTrail(): void {
    // Add current position to trail
    this.trail.unshift({
      x: this.state.x,
      y: this.state.y,
      opacity: this.config.trailOpacity,
    });

    // Limit trail length
    if (this.trail.length > this.config.trailLength) {
      this.trail.pop();
    }

    // Fade trail points
    this.trail.forEach((point, index) => {
      point.opacity = this.config.trailOpacity * (1 - index / this.trail.length);
    });
  }

  /**
   * Update canvas dimensions (e.g., on resize)
   */
  updateCanvasDimensions(width: number, height: number): void {
    // Scale position proportionally
    const scaleX = width / this.canvasWidth;
    const scaleY = height / this.canvasHeight;

    this.state.x *= scaleX;
    this.state.y *= scaleY;

    this.canvasWidth = width;
    this.canvasHeight = height;
  }

  /**
   * Get the ball's bounding box for collision detection
   */
  getBoundingBox(): { left: number; right: number; top: number; bottom: number } {
    return {
      left: this.state.x - this.state.radius,
      right: this.state.x + this.state.radius,
      top: this.state.y - this.state.radius,
      bottom: this.state.y + this.state.radius,
    };
  }

  /**
   * Get current speed
   */
  getSpeed(): number {
    return Math.sqrt(this.state.velocityX ** 2 + this.state.velocityY ** 2);
  }

  /**
   * Render the ball to a canvas context
   */
  render(ctx: CanvasRenderingContext2D): void {
    // Render trail first (behind ball)
    this.renderTrail(ctx);

    // Render ball
    ctx.save();

    // Set glow effect
    ctx.shadowColor = this.config.glowColor;
    ctx.shadowBlur = this.config.glowBlur;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Draw ball
    ctx.beginPath();
    ctx.arc(this.state.x, this.state.y, this.state.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.config.glowColor;
    ctx.fill();

    // Add highlight
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.arc(
      this.state.x - this.state.radius * 0.3,
      this.state.y - this.state.radius * 0.3,
      this.state.radius * 0.3,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.fill();

    ctx.restore();
  }

  /**
   * Render the ball's trail
   */
  private renderTrail(ctx: CanvasRenderingContext2D): void {
    if (this.trail.length < 2) return;

    ctx.save();

    for (let i = 0; i < this.trail.length; i++) {
      const point = this.trail[i];
      const radius = this.state.radius * (1 - i / this.trail.length * 0.5);

      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 0, ${point.opacity})`;
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Check if ball collides with a brick and resolve the collision
   * Returns true if collision occurred
   */
  resolveBrickCollision(
    brickLeft: number,
    brickRight: number,
    brickTop: number,
    brickBottom: number
  ): boolean {
    // Find closest point on brick to ball center
    const closestX = Math.max(brickLeft, Math.min(this.state.x, brickRight));
    const closestY = Math.max(brickTop, Math.min(this.state.y, brickBottom));

    // Calculate distance
    const distanceX = this.state.x - closestX;
    const distanceY = this.state.y - closestY;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;

    if (distanceSquared < this.state.radius * this.state.radius) {
      // Collision detected - determine which side was hit
      const overlapX = this.state.radius - Math.abs(distanceX);
      const overlapY = this.state.radius - Math.abs(distanceY);

      // Bounce based on which side had smaller overlap
      if (overlapX < overlapY) {
        // Hit from left or right
        this.state.velocityX = -this.state.velocityX;
        this.state.x += distanceX > 0 ? overlapX : -overlapX;
      } else {
        // Hit from top or bottom
        this.state.velocityY = -this.state.velocityY;
        this.state.y += distanceY > 0 ? overlapY : -overlapY;
      }

      return true;
    }

    return false;
  }
}

export default Ball;
