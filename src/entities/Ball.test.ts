import { describe, it, expect, beforeEach, vi } from 'vitest';
import Ball, { DEFAULT_BALL_CONFIG } from './Ball';

describe('Ball Entity', () => {
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  let ball: Ball;

  beforeEach(() => {
    ball = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT);
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const state = ball.getState();

      expect(state.x).toBe(CANVAS_WIDTH / 2);
      expect(state.y).toBe(CANVAS_HEIGHT / 2);
      expect(state.velocityX).toBe(0);
      expect(state.velocityY).toBe(0);
      expect(state.radius).toBe(DEFAULT_BALL_CONFIG.radius);
      expect(state.isActive).toBe(false);
    });

    it('should use custom config when provided', () => {
      const customBall = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, {
        radius: 12,
        initialSpeed: 8,
        minSpeed: 5,
        maxSpeed: 15,
      });

      const state = customBall.getState();
      const config = customBall.getConfig();

      expect(config.radius).toBe(12);
      expect(config.initialSpeed).toBe(8);
      expect(config.minSpeed).toBe(5);
      expect(config.maxSpeed).toBe(15);
      expect(state.radius).toBe(12);
    });
  });

  describe('Launch', () => {
    it('should launch ball with upward velocity', () => {
      ball.launch();

      const state = ball.getState();
      expect(state.isActive).toBe(true);
      expect(state.velocityY).toBeLessThan(0); // Moving upward
    });

    it('should not launch if already active', () => {
      ball.launch();
      const firstVelocityX = ball.getState().velocityX;

      ball.launch(); // Try to launch again
      const secondVelocityX = ball.getState().velocityX;

      expect(secondVelocityX).toBe(firstVelocityX);
    });

    it('should have speed within initial range', () => {
      ball.launch();

      const speed = ball.getSpeed();
      expect(speed).toBeGreaterThanOrEqual(DEFAULT_BALL_CONFIG.initialSpeed - 0.1);
      expect(speed).toBeLessThanOrEqual(DEFAULT_BALL_CONFIG.initialSpeed + 0.1);
    });
  });

  describe('Movement', () => {
    it('should move with velocity.x and velocity.y each frame', () => {
      ball.setPosition(400, 300);
      ball.launch();

      const initialX = ball.getState().x;
      const initialY = ball.getState().y;

      // Simulate one frame at 60fps
      ball.update(1 / 60, 400, 100, 550);

      const newState = ball.getState();
      expect(newState.x).not.toBe(initialX);
      expect(newState.y).not.toBe(initialY);
    });

    it('should not move when not active', () => {
      ball.setPosition(400, 300);

      const initialX = ball.getState().x;
      const initialY = ball.getState().y;

      ball.update(1 / 60, 400, 100, 550);

      const newState = ball.getState();
      expect(newState.x).toBe(initialX);
      expect(newState.y).toBe(initialY);
    });
  });

  describe('Wall Collisions', () => {
    beforeEach(() => {
      ball.launch();
    });

    it('should bounce off left wall', () => {
      ball.setPosition(10, 300);
      ball.launch();

      // Set velocity to move left
      ball.setVelocity(-10, 0);

      ball.update(1 / 60, 400, 100, 550);

      // After bouncing, velocityX should be positive
      expect(ball.getState().velocityX).toBeGreaterThan(0);
    });

    it('should bounce off right wall', () => {
      ball.setPosition(CANVAS_WIDTH - 10, 300);
      ball.launch();

      // Set velocity to move right
      ball.setVelocity(10, 0);

      ball.update(1 / 60, 400, 100, 550);

      // After bouncing, velocityX should be negative
      expect(ball.getState().velocityX).toBeLessThan(0);
    });

    it('should bounce off top wall', () => {
      ball.setPosition(400, 10);
      ball.launch();

      // Set velocity to move up
      ball.setVelocity(0, -10);

      ball.update(1 / 60, 400, 100, 550);

      // After bouncing, velocityY should be positive
      expect(ball.getState().velocityY).toBeGreaterThan(0);
    });

    it('should keep ball within bounds after bounce', () => {
      ball.setPosition(5, 300);
      ball.launch();

      // Fast leftward velocity
      ball.setVelocity(-20, 0);

      ball.update(1 / 60, 400, 100, 550);

      const newState = ball.getState();
      expect(newState.x).toBeGreaterThanOrEqual(DEFAULT_BALL_CONFIG.radius);
    });
  });

  describe('Paddle Angle Physics', () => {
    beforeEach(() => {
      ball.launch();
    });

    it('should bounce straight up when hitting paddle center', () => {
      const paddleX = 400;
      const paddleWidth = 100;
      const paddleY = 550;

      // Position ball directly above paddle center
      ball.setPosition(paddleX, paddleY - DEFAULT_BALL_CONFIG.radius - 1);

      // Moving down
      ball.setVelocity(0, 5);

      ball.update(1 / 60, paddleX, paddleWidth, paddleY);

      // Should bounce straight up (velocityX near 0)
      expect(Math.abs(ball.getState().velocityX)).toBeLessThan(0.5);
      expect(ball.getState().velocityY).toBeLessThan(0);
    });

    it('should bounce at angle when hitting paddle edge', () => {
      const paddleX = 400;
      const paddleWidth = 100;
      const paddleY = 550;
      const paddleHalfWidth = paddleWidth / 2;

      // Position ball at paddle left edge
      ball.setPosition(paddleX - paddleHalfWidth + 5, paddleY - DEFAULT_BALL_CONFIG.radius - 1);

      // Moving down
      ball.setVelocity(0, 5);

      ball.update(1 / 60, paddleX, paddleWidth, paddleY);

      // Should bounce with negative velocityX (to the left)
      expect(ball.getState().velocityX).toBeLessThan(0);
    });

    it('should bounce at max 70 degrees for edge hits', () => {
      const paddleX = 400;
      const paddleWidth = 100;
      const paddleY = 550;
      const paddleHalfWidth = paddleWidth / 2;

      // Test multiple positions across paddle
      const testPositions = [
        paddleX - paddleHalfWidth + 2, // Far left
        paddleX + paddleHalfWidth - 2, // Far right
      ];

      for (const posX of testPositions) {
        const testBall = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT);
        testBall.launch();
        testBall.setPosition(posX, paddleY - DEFAULT_BALL_CONFIG.radius - 1);

        testBall.setVelocity(0, 5);

        testBall.update(1 / 60, paddleX, paddleWidth, paddleY);

        const newState = testBall.getState();
        const angle = Math.atan2(Math.abs(newState.velocityX), Math.abs(newState.velocityY));
        const angleDegrees = (angle * 180) / Math.PI;

        expect(angleDegrees).toBeLessThanOrEqual(70 + 1); // Allow small tolerance
      }
    });
  });

  describe('Speed Caps', () => {
    it('should enforce minimum speed of 4px/frame', () => {
      ball.launch();

      ball.setVelocity(1, 1);

      ball.update(1 / 60, 400, 100, 550);

      expect(ball.getSpeed()).toBeGreaterThanOrEqual(4);
    });

    it('should enforce maximum speed of 12px/frame', () => {
      ball.launch();

      ball.setVelocity(20, 20);

      ball.update(1 / 60, 400, 100, 550);

      expect(ball.getSpeed()).toBeLessThanOrEqual(12);
    });

    it('should respect custom speed caps', () => {
      const customBall = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, {
        minSpeed: 5,
        maxSpeed: 15,
      });
      customBall.launch();

      customBall.setVelocity(25, 25);

      customBall.update(1 / 60, 400, 100, 550);

      expect(customBall.getSpeed()).toBeLessThanOrEqual(15);
    });
  });

  describe('Life Lost', () => {
    it('should trigger life lost when ball passes below paddle', () => {
      const lifeLostCallback = vi.fn();
      ball.onLifeLost(lifeLostCallback);
      ball.launch();

      // Position ball below canvas
      ball.setPosition(400, CANVAS_HEIGHT + 20);
      ball.setVelocity(0, 5); // Moving down

      const lifeLost = ball.update(1 / 60, 400, 100, 550);

      expect(lifeLost).toBe(true);
      expect(lifeLostCallback).toHaveBeenCalled();
      expect(ball.getState().isActive).toBe(false);
    });

    it('should reset ball position on reset', () => {
      ball.setPosition(100, 100);
      ball.launch();
      ball.reset();

      const state = ball.getState();
      expect(state.x).toBe(CANVAS_WIDTH / 2);
      expect(state.y).toBe(CANVAS_HEIGHT / 2);
      expect(state.isActive).toBe(false);
      expect(state.velocityX).toBe(0);
      expect(state.velocityY).toBe(0);
    });
  });

  describe('Trail Effect', () => {
    it('should have empty trail when not active', () => {
      expect(ball.getTrail().length).toBe(0);
    });

    it('should build trail when moving', () => {
      ball.launch();
      ball.setPosition(400, 300);

      // Update multiple times
      for (let i = 0; i < 5; i++) {
        ball.update(1 / 60, 400, 100, 550);
      }

      expect(ball.getTrail().length).toBeGreaterThan(0);
    });

    it('should limit trail length', () => {
      const customBall = new Ball(CANVAS_WIDTH, CANVAS_HEIGHT, {
        trailLength: 3,
      });
      customBall.launch();
      customBall.setPosition(400, 300);

      // Update many times
      for (let i = 0; i < 10; i++) {
        customBall.update(1 / 60, 400, 100, 550);
      }

      expect(customBall.getTrail().length).toBeLessThanOrEqual(3);
    });

    it('should clear trail on reset', () => {
      ball.launch();
      ball.setPosition(400, 300);

      // Build up trail
      for (let i = 0; i < 5; i++) {
        ball.update(1 / 60, 400, 100, 550);
      }

      expect(ball.getTrail().length).toBeGreaterThan(0);

      ball.reset();
      expect(ball.getTrail().length).toBe(0);
    });
  });

  describe('Brick Collision', () => {
    beforeEach(() => {
      ball.launch();
    });

    it('should detect collision with brick', () => {
      ball.setPosition(200, 200);

      const hit = ball.resolveBrickCollision(190, 210, 190, 210);

      expect(hit).toBe(true);
    });

    it('should not detect collision when far from brick', () => {
      ball.setPosition(100, 100);

      const hit = ball.resolveBrickCollision(500, 600, 500, 600);

      expect(hit).toBe(false);
    });

    it('should bounce horizontally when hitting brick side', () => {
      ball.setPosition(100, 200);
      ball.launch();

      ball.setVelocity(5, 0);

      const initialVelocityX = ball.getState().velocityX;
      ball.resolveBrickCollision(90, 110, 150, 250);

      // Velocity X should have reversed
      expect(ball.getState().velocityX).toBe(-initialVelocityX);
    });

    it('should bounce vertically when hitting brick top/bottom', () => {
      ball.setPosition(200, 100);
      ball.launch();

      ball.setVelocity(0, 5);

      const initialVelocityY = ball.getState().velocityY;
      ball.resolveBrickCollision(150, 250, 90, 110);

      // Velocity Y should have reversed
      expect(ball.getState().velocityY).toBe(-initialVelocityY);
    });
  });

  describe('Canvas Resize', () => {
    it('should update dimensions and scale position', () => {
      ball.setPosition(400, 300); // Half of 800x600
      ball.launch();

      ball.updateCanvasDimensions(1024, 768);

      // Position should scale proportionally
      expect(ball.getState().x).toBe(512); // 400 * (1024/800)
      expect(ball.getState().y).toBe(384); // 300 * (768/600)
    });

    it('should maintain relative position after resize', () => {
      ball.setPosition(200, 150); // Quarter of 800x600
      ball.launch();

      ball.updateCanvasDimensions(400, 300);

      expect(ball.getState().x).toBe(100); // 200 * (400/800)
      expect(ball.getState().y).toBe(75); // 150 * (300/600)
    });
  });

  describe('Bounding Box', () => {
    it('should return correct bounding box', () => {
      ball.setPosition(400, 300);

      const bbox = ball.getBoundingBox();

      expect(bbox.left).toBe(400 - DEFAULT_BALL_CONFIG.radius);
      expect(bbox.right).toBe(400 + DEFAULT_BALL_CONFIG.radius);
      expect(bbox.top).toBe(300 - DEFAULT_BALL_CONFIG.radius);
      expect(bbox.bottom).toBe(300 + DEFAULT_BALL_CONFIG.radius);
    });
  });
});
