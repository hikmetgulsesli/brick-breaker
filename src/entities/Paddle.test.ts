import { describe, it, expect, beforeEach } from 'vitest';
import Paddle, { DEFAULT_PADDLE_CONFIG } from './Paddle';

describe('Paddle Entity', () => {
  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  let paddle: Paddle;

  beforeEach(() => {
    paddle = new Paddle(CANVAS_WIDTH, CANVAS_HEIGHT);
  });

  describe('Initialization', () => {
    it('should initialize with correct default state', () => {
      const state = paddle.getState();
      
      expect(state.x).toBe(0.5); // Centered
      expect(state.y).toBe(CANVAS_HEIGHT - DEFAULT_PADDLE_CONFIG.bottomMargin - DEFAULT_PADDLE_CONFIG.height);
      expect(state.width).toBe(DEFAULT_PADDLE_CONFIG.normalWidth);
      expect(state.height).toBe(DEFAULT_PADDLE_CONFIG.height);
      expect(state.type).toBe('normal');
      expect(state.hasLaser).toBe(false);
    });

    it('should use custom config when provided', () => {
      const customPaddle = new Paddle(CANVAS_WIDTH, CANVAS_HEIGHT, {
        normalWidth: 120,
        height: 20,
        bottomMargin: 30,
      });

      const state = customPaddle.getState();
      const config = customPaddle.getConfig();
      
      expect(config.normalWidth).toBe(120);
      expect(config.height).toBe(20);
      expect(config.bottomMargin).toBe(30);
      expect(state.width).toBe(120);
      expect(state.height).toBe(20);
      expect(state.y).toBe(CANVAS_HEIGHT - 30 - 20);
    });
  });

  describe('Position', () => {
    it('should set position correctly (normalized 0-1)', () => {
      paddle.setPosition(0.25);
      expect(paddle.getState().x).toBe(0.25);
      expect(paddle.getPixelX()).toBe(200); // 0.25 * 800
    });

    it('should clamp position to 0-1 range', () => {
      paddle.setPosition(-0.5);
      expect(paddle.getState().x).toBe(0);

      paddle.setPosition(1.5);
      expect(paddle.getState().x).toBe(1);
    });

    it('should calculate pixel positions correctly', () => {
      paddle.setPosition(0.5);
      
      expect(paddle.getPixelX()).toBe(400); // Center of 800px canvas
      expect(paddle.getCenterX()).toBe(400);
      expect(paddle.getLeftEdge()).toBe(350); // 400 - 50 (half width)
      expect(paddle.getRightEdge()).toBe(450); // 400 + 50 (half width)
    });
  });

  describe('Paddle Types', () => {
    it('should activate wide paddle', () => {
      paddle.activateWide();
      
      const state = paddle.getState();
      expect(state.type).toBe('wide');
      expect(state.width).toBe(DEFAULT_PADDLE_CONFIG.wideWidth);
    });

    it('should deactivate wide paddle', () => {
      paddle.activateWide();
      paddle.deactivateWide();
      
      const state = paddle.getState();
      expect(state.type).toBe('normal');
      expect(state.width).toBe(DEFAULT_PADDLE_CONFIG.normalWidth);
    });

    it('should update edge positions when type changes', () => {
      paddle.setPosition(0.5);
      
      // Normal width
      expect(paddle.getLeftEdge()).toBe(350);
      expect(paddle.getRightEdge()).toBe(450);
      
      // Wide width
      paddle.activateWide();
      expect(paddle.getLeftEdge()).toBe(325); // 400 - 75
      expect(paddle.getRightEdge()).toBe(475); // 400 + 75
    });
  });

  describe('Laser Power-up', () => {
    it('should activate laser', () => {
      paddle.setLaser(true);
      expect(paddle.getState().hasLaser).toBe(true);
    });

    it('should deactivate laser', () => {
      paddle.setLaser(true);
      paddle.setLaser(false);
      expect(paddle.getState().hasLaser).toBe(false);
    });
  });

  describe('Collision Detection', () => {
    beforeEach(() => {
      paddle.setPosition(0.5); // Center at x=400
    });

    it('should detect point inside paddle', () => {
      // Center of paddle
      expect(paddle.containsPoint(400, paddle.getState().y + 5)).toBe(true);
      
      // Left edge
      expect(paddle.containsPoint(350, paddle.getState().y + 5)).toBe(true);
      
      // Right edge
      expect(paddle.containsPoint(450, paddle.getState().y + 5)).toBe(true);
    });

    it('should not detect point outside paddle', () => {
      // Too far left
      expect(paddle.containsPoint(300, paddle.getState().y + 5)).toBe(false);
      
      // Too far right
      expect(paddle.containsPoint(500, paddle.getState().y + 5)).toBe(false);
      
      // Above paddle
      expect(paddle.containsPoint(400, paddle.getState().y - 5)).toBe(false);
      
      // Below paddle
      expect(paddle.containsPoint(400, paddle.getState().y + 25)).toBe(false);
    });

    it('should return correct bounding box', () => {
      const bbox = paddle.getBoundingBox();
      
      expect(bbox.left).toBe(350);
      expect(bbox.right).toBe(450);
      expect(bbox.top).toBe(paddle.getState().y);
      expect(bbox.bottom).toBe(paddle.getState().y + paddle.getState().height);
    });
  });

  describe('Reset', () => {
    it('should reset to initial state', () => {
      paddle.setPosition(0.25);
      paddle.activateWide();
      paddle.setLaser(true);
      
      paddle.reset();
      
      const state = paddle.getState();
      expect(state.x).toBe(0.5);
      expect(state.type).toBe('normal');
      expect(state.width).toBe(DEFAULT_PADDLE_CONFIG.normalWidth);
      expect(state.hasLaser).toBe(false);
    });
  });

  describe('Canvas Resize', () => {
    it('should update dimensions and recalculate Y position', () => {
      const originalY = paddle.getState().y;
      
      paddle.updateCanvasDimensions(1024, 768);
      
      const newY = 768 - DEFAULT_PADDLE_CONFIG.bottomMargin - DEFAULT_PADDLE_CONFIG.height;
      expect(paddle.getState().y).toBe(newY);
      expect(paddle.getState().y).not.toBe(originalY);
    });

    it('should maintain relative X position after resize', () => {
      paddle.setPosition(0.5);
      
      paddle.updateCanvasDimensions(1024, 768);
      
      expect(paddle.getState().x).toBe(0.5);
      expect(paddle.getPixelX()).toBe(512); // 0.5 * 1024
    });
  });

  describe('Glow Effects', () => {
    it('should return normal glow color for normal paddle', () => {
      expect(paddle.getGlowColor()).toBe(DEFAULT_PADDLE_CONFIG.glowColor);
      expect(paddle.getGlowBlur()).toBe(DEFAULT_PADDLE_CONFIG.glowBlur);
    });

    it('should return wide glow color for wide paddle', () => {
      paddle.activateWide();
      
      expect(paddle.getGlowColor()).toBe(DEFAULT_PADDLE_CONFIG.wideGlowColor);
      expect(paddle.getGlowBlur()).toBe(DEFAULT_PADDLE_CONFIG.wideGlowBlur);
    });
  });

  describe('Edge Positions', () => {
    it('should return correct top and bottom edges', () => {
      const state = paddle.getState();
      
      expect(paddle.getTopEdge()).toBe(state.y);
      expect(paddle.getBottomEdge()).toBe(state.y + state.height);
    });
  });
});
