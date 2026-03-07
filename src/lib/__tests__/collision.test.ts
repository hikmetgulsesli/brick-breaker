/**
 * @jest-environment node
 * Tests for collision detection system
 */

import {
  vec2,
  add,
  subtract,
  multiply,
  magnitude,
  normalize,
  dot,
  getBrickAABB,
  getPaddleAABB,
  checkAABBCollision,
  checkCircleRectCollision,
  checkBallBrickCollision,
  checkBallPaddleCollision,
  checkBallWallCollision,
  checkSubFrameCollision,
  reflectVelocity,
  resolveBallCollision,
  calculatePaddleBounceVelocity,
  checkAllBrickCollisions,
} from '../collision';
import type { Ball, Brick, Paddle, GameBounds } from '../../entities/types';

describe('Vector Math', () => {
  describe('vec2', () => {
    it('creates a vector with x and y components', () => {
      const v = vec2(3, 4);
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });
  });

  describe('add', () => {
    it('adds two vectors component-wise', () => {
      const a = vec2(1, 2);
      const b = vec2(3, 4);
      const result = add(a, b);
      expect(result).toEqual({ x: 4, y: 6 });
    });
  });

  describe('subtract', () => {
    it('subtracts two vectors component-wise', () => {
      const a = vec2(5, 7);
      const b = vec2(2, 3);
      const result = subtract(a, b);
      expect(result).toEqual({ x: 3, y: 4 });
    });
  });

  describe('multiply', () => {
    it('multiplies vector by scalar', () => {
      const v = vec2(2, 3);
      const result = multiply(v, 2);
      expect(result).toEqual({ x: 4, y: 6 });
    });
  });

  describe('magnitude', () => {
    it('calculates vector magnitude', () => {
      const v = vec2(3, 4);
      expect(magnitude(v)).toBe(5);
    });

    it('returns 0 for zero vector', () => {
      expect(magnitude(vec2(0, 0))).toBe(0);
    });
  });

  describe('normalize', () => {
    it('returns unit vector', () => {
      const v = vec2(3, 4);
      const result = normalize(v);
      expect(result.x).toBeCloseTo(0.6);
      expect(result.y).toBeCloseTo(0.8);
    });

    it('returns zero vector for zero input', () => {
      const result = normalize(vec2(0, 0));
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe('dot', () => {
    it('calculates dot product', () => {
      const a = vec2(1, 2);
      const b = vec2(3, 4);
      expect(dot(a, b)).toBe(11); // 1*3 + 2*4
    });
  });
});

describe('AABB Collision Detection', () => {
  it('detects collision when rectangles overlap', () => {
    const a: AABB = { x: 0, y: 0, width: 10, height: 10 };
    const b: AABB = { x: 5, y: 5, width: 10, height: 10 };
    const result = checkAABBCollision(a, b);
    expect(result.collided).toBe(true);
  });

  it('returns no collision when rectangles are separate', () => {
    const a: AABB = { x: 0, y: 0, width: 10, height: 10 };
    const b: AABB = { x: 20, y: 20, width: 10, height: 10 };
    const result = checkAABBCollision(a, b);
    expect(result.collided).toBe(false);
  });

  it('returns correct normal for horizontal collision', () => {
    const a: AABB = { x: 0, y: 0, width: 10, height: 10 };
    const b: AABB = { x: 8, y: 2, width: 10, height: 6 };
    const result = checkAABBCollision(a, b);
    expect(result.collided).toBe(true);
    expect(result.normal).toEqual({ x: 1, y: 0 });
  });

  it('returns correct normal for vertical collision', () => {
    const a: AABB = { x: 0, y: 0, width: 10, height: 10 };
    const b: AABB = { x: 2, y: 8, width: 6, height: 10 };
    const result = checkAABBCollision(a, b);
    expect(result.collided).toBe(true);
    expect(result.normal).toEqual({ x: 0, y: 1 });
  });

  it('calculates penetration depth', () => {
    const a: AABB = { x: 0, y: 0, width: 10, height: 10 };
    const b: AABB = { x: 8, y: 0, width: 10, height: 10 };
    const result = checkAABBCollision(a, b);
    expect(result.penetration).toBe(2);
  });
});

describe('Circle-Rectangle Collision Detection', () => {
  it('detects collision when circle overlaps rectangle', () => {
    const circle = { x: 5, y: 5, radius: 3 };
    const rect: AABB = { x: 0, y: 0, width: 10, height: 10 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(true);
  });

  it('detects collision when circle is inside rectangle', () => {
    const circle = { x: 5, y: 5, radius: 2 };
    const rect: AABB = { x: 0, y: 0, width: 20, height: 20 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(true);
  });

  it('returns no collision when circle is far away', () => {
    const circle = { x: 50, y: 50, radius: 5 };
    const rect: AABB = { x: 0, y: 0, width: 10, height: 10 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(false);
  });

  it('detects collision from top edge', () => {
    const circle = { x: 5, y: -2, radius: 3 };
    const rect: AABB = { x: 0, y: 0, width: 10, height: 10 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(true);
    expect(result.normal).toEqual({ x: 0, y: -1 });
  });

  it('detects collision from right edge', () => {
    const circle = { x: 14, y: 5, radius: 5 };
    const rect: AABB = { x: 0, y: 0, width: 10, height: 10 };
    const result = checkCircleRectCollision(circle, rect);
    expect(result.collided).toBe(true);
    expect(result.normal).toEqual({ x: 1, y: 0 });
  });
});

describe('Ball-Brick Collision Detection', () => {
  it('detects collision with active brick', () => {
    const ball: Ball = {
      position: vec2(35, 35),
      velocity: vec2(0, 100),
      radius: 5,
      speed: 100,
    };
    const brick: Brick = {
      id: 'test-1',
      position: vec2(30, 30),
      width: 60,
      height: 24,
      durability: 1,
      isDestroyed: false,
    };
    const result = checkBallBrickCollision(ball, brick);
    expect(result.collided).toBe(true);
    expect(result.brickId).toBe('test-1');
  });

  it('returns no collision with destroyed brick', () => {
    const ball: Ball = {
      position: vec2(35, 35),
      velocity: vec2(0, 100),
      radius: 5,
      speed: 100,
    };
    const brick: Brick = {
      id: 'test-1',
      position: vec2(30, 30),
      width: 60,
      height: 24,
      durability: 1,
      isDestroyed: true,
    };
    const result = checkBallBrickCollision(ball, brick);
    expect(result.collided).toBe(false);
  });

  it('returns no collision when ball is far from brick', () => {
    const ball: Ball = {
      position: vec2(200, 200),
      velocity: vec2(0, 100),
      radius: 5,
      speed: 100,
    };
    const brick: Brick = {
      id: 'test-1',
      position: vec2(30, 30),
      width: 60,
      height: 24,
      durability: 1,
      isDestroyed: false,
    };
    const result = checkBallBrickCollision(ball, brick);
    expect(result.collided).toBe(false);
  });
});

describe('Ball-Paddle Collision Detection', () => {
  it('detects collision between ball and paddle', () => {
    const ball: Ball = {
      position: vec2(55, 485),
      velocity: vec2(0, 100),
      radius: 5,
      speed: 100,
    };
    const paddle: Paddle = {
      position: vec2(50, 490),
      width: 100,
      height: 15,
    };
    const result = checkBallPaddleCollision(ball, paddle);
    expect(result.collided).toBe(true);
  });

  it('returns correct hit position (center)', () => {
    const ball: Ball = {
      position: vec2(100, 485),
      velocity: vec2(0, 100),
      radius: 5,
      speed: 100,
    };
    const paddle: Paddle = {
      position: vec2(50, 490),
      width: 100,
      height: 15,
    };
    const result = checkBallPaddleCollision(ball, paddle);
    expect(result.collided).toBe(true);
    expect(result.hitPosition).toBeCloseTo(0, 1);
  });

  it('returns correct hit position (left edge)', () => {
    const ball: Ball = {
      position: vec2(55, 485),
      velocity: vec2(0, 100),
      radius: 5,
      speed: 100,
    };
    const paddle: Paddle = {
      position: vec2(50, 490),
      width: 100,
      height: 15,
    };
    const result = checkBallPaddleCollision(ball, paddle);
    expect(result.collided).toBe(true);
    expect(result.hitPosition).toBeCloseTo(0.1, 1);
  });

  it('returns correct hit position (right edge)', () => {
    const ball: Ball = {
      position: vec2(145, 485),
      velocity: vec2(0, 100),
      radius: 5,
      speed: 100,
    };
    const paddle: Paddle = {
      position: vec2(50, 490),
      width: 100,
      height: 15,
    };
    const result = checkBallPaddleCollision(ball, paddle);
    expect(result.collided).toBe(true);
    expect(result.hitPosition).toBeCloseTo(0.9, 1);
  });
});

describe('Ball-Wall Collision Detection', () => {
  const bounds: GameBounds = { width: 800, height: 600 };

  it('detects left wall collision', () => {
    const ball: Ball = {
      position: vec2(3, 300),
      velocity: vec2(-100, 0),
      radius: 5,
      speed: 100,
    };
    const result = checkBallWallCollision(ball, bounds);
    expect(result.collided).toBe(true);
    expect(result.wall).toBe('left');
    expect(result.normal).toEqual({ x: 1, y: 0 });
  });

  it('detects right wall collision', () => {
    const ball: Ball = {
      position: vec2(797, 300),
      velocity: vec2(100, 0),
      radius: 5,
      speed: 100,
    };
    const result = checkBallWallCollision(ball, bounds);
    expect(result.collided).toBe(true);
    expect(result.wall).toBe('right');
    expect(result.normal).toEqual({ x: -1, y: 0 });
  });

  it('detects top wall collision', () => {
    const ball: Ball = {
      position: vec2(400, 3),
      velocity: vec2(0, -100),
      radius: 5,
      speed: 100,
    };
    const result = checkBallWallCollision(ball, bounds);
    expect(result.collided).toBe(true);
    expect(result.wall).toBe('top');
    expect(result.normal).toEqual({ x: 0, y: 1 });
  });

  it('detects bottom wall collision', () => {
    const ball: Ball = {
      position: vec2(400, 597),
      velocity: vec2(0, 100),
      radius: 5,
      speed: 100,
    };
    const result = checkBallWallCollision(ball, bounds);
    expect(result.collided).toBe(true);
    expect(result.wall).toBe('bottom');
    expect(result.normal).toEqual({ x: 0, y: -1 });
  });

  it('returns no collision when ball is within bounds', () => {
    const ball: Ball = {
      position: vec2(400, 300),
      velocity: vec2(100, 100),
      radius: 5,
      speed: 100,
    };
    const result = checkBallWallCollision(ball, bounds);
    expect(result.collided).toBe(false);
  });
});

describe('Sub-Frame Collision Detection', () => {
  it('detects collision during frame movement', () => {
    const start = vec2(10, 10);
    const end = vec2(100, 100);
    const rect: AABB = { x: 50, y: 50, width: 20, height: 20 };
    const result = checkSubFrameCollision(start, end, 5, rect);
    expect(result.collided).toBe(true);
    expect(result.timeOfImpact).toBeGreaterThan(0);
    expect(result.timeOfImpact).toBeLessThan(1);
  });

  it('returns no collision when path misses rectangle', () => {
    const start = vec2(10, 10);
    const end = vec2(20, 20);
    const rect: AABB = { x: 100, y: 100, width: 20, height: 20 };
    const result = checkSubFrameCollision(start, end, 5, rect);
    expect(result.collided).toBe(false);
  });

  it('returns timeOfImpact = 0 when already overlapping', () => {
    const start = vec2(60, 60);
    const end = vec2(100, 100);
    const rect: AABB = { x: 50, y: 50, width: 20, height: 20 };
    const result = checkSubFrameCollision(start, end, 5, rect);
    expect(result.collided).toBe(true);
    expect(result.timeOfImpact).toBe(0);
  });

  it('prevents tunneling at high speeds', () => {
    // Ball moving so fast it would pass through a thin wall
    const start = vec2(0, 55);
    const end = vec2(200, 55);
    const thinWall: AABB = { x: 100, y: 50, width: 2, height: 10 };
    const result = checkSubFrameCollision(start, end, 5, thinWall);
    expect(result.collided).toBe(true);
    expect(result.timeOfImpact).toBeGreaterThan(0);
  });
});

describe('Velocity Reflection', () => {
  it('reflects velocity off horizontal surface', () => {
    const velocity = vec2(100, 100);
    const normal = vec2(0, -1); // Ceiling
    const result = reflectVelocity(velocity, normal);
    expect(result.x).toBe(100);
    expect(result.y).toBe(-100);
  });

  it('reflects velocity off vertical surface', () => {
    const velocity = vec2(100, 100);
    const normal = vec2(-1, 0); // Left wall
    const result = reflectVelocity(velocity, normal);
    expect(result.x).toBe(-100);
    expect(result.y).toBe(100);
  });

  it('reflects velocity at 45 degrees', () => {
    const velocity = vec2(100, 100);
    const normal = normalize(vec2(-1, -1));
    const result = reflectVelocity(velocity, normal);
    // Should reflect both components
    expect(result.x).toBeCloseTo(-100, 0);
    expect(result.y).toBeCloseTo(-100, 0);
  });
});

describe('Ball Collision Resolution', () => {
  it('corrects position on collision', () => {
    const ball: Ball = {
      position: vec2(55, 35),
      velocity: vec2(100, 50),
      radius: 5,
      speed: 100,
    };
    const collision = {
      collided: true,
      normal: vec2(-1, 0),
      penetration: 5,
      contactPoint: vec2(50, 35),
    };
    const result = resolveBallCollision(ball, collision);
    expect(result.position.x).toBe(60); // 55 + 5
    expect(result.position.y).toBe(35);
  });

  it('reflects velocity on collision', () => {
    const ball: Ball = {
      position: vec2(55, 35),
      velocity: vec2(100, 50),
      radius: 5,
      speed: 100,
    };
    const collision = {
      collided: true,
      normal: vec2(-1, 0),
      penetration: 5,
      contactPoint: vec2(50, 35),
    };
    const result = resolveBallCollision(ball, collision);
    expect(result.velocity.x).toBe(-100);
    expect(result.velocity.y).toBe(50);
  });

  it('returns unchanged ball when no collision', () => {
    const ball: Ball = {
      position: vec2(100, 100),
      velocity: vec2(50, 50),
      radius: 5,
      speed: 100,
    };
    const result = resolveBallCollision(ball, { collided: false });
    expect(result).toEqual(ball);
  });
});

describe('Paddle Bounce Calculation', () => {
  it('returns upward velocity for center hit', () => {
    const velocity = calculatePaddleBounceVelocity(100, 0);
    expect(velocity.y).toBeLessThan(0); // Moving up
    expect(velocity.x).toBeCloseTo(0, 5);
  });

  it('returns left-angled velocity for left edge hit', () => {
    const velocity = calculatePaddleBounceVelocity(100, -1);
    expect(velocity.y).toBeLessThan(0); // Moving up
    expect(velocity.x).toBeLessThan(0); // Moving left
  });

  it('returns right-angled velocity for right edge hit', () => {
    const velocity = calculatePaddleBounceVelocity(100, 1);
    expect(velocity.y).toBeLessThan(0); // Moving up
    expect(velocity.x).toBeGreaterThan(0); // Moving right
  });

  it('clamps hit position to [-1, 1]', () => {
    const v1 = calculatePaddleBounceVelocity(100, -2);
    const v2 = calculatePaddleBounceVelocity(100, -1);
    expect(v1.x).toBe(v2.x);

    const v3 = calculatePaddleBounceVelocity(100, 2);
    const v4 = calculatePaddleBounceVelocity(100, 1);
    expect(v3.x).toBe(v4.x);
  });

  it('maintains consistent speed', () => {
    const speed = 100;
    for (let pos = -1; pos <= 1; pos += 0.5) {
      const velocity = calculatePaddleBounceVelocity(speed, pos);
      const actualSpeed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      expect(actualSpeed).toBeCloseTo(speed, 0);
    }
  });
});

describe('Multiple Brick Collision Detection', () => {
  it('returns collision with first brick hit', () => {
    const ball: Ball = {
      position: vec2(35, 35),
      velocity: vec2(0, 0),
      radius: 5,
      speed: 100,
    };
    const bricks: Brick[] = [
      {
        id: 'brick-1',
        position: vec2(30, 30),
        width: 60,
        height: 24,
        durability: 1,
        isDestroyed: false,
      },
      {
        id: 'brick-2',
        position: vec2(100, 100),
        width: 60,
        height: 24,
        durability: 1,
        isDestroyed: false,
      },
    ];
    const result = checkAllBrickCollisions(ball, bricks, 1 / 60);
    expect(result.collided).toBe(true);
    expect(result.brickId).toBe('brick-1');
  });

  it('skips destroyed bricks', () => {
    const ball: Ball = {
      position: vec2(35, 35),
      velocity: vec2(0, 0),
      radius: 5,
      speed: 100,
    };
    const bricks: Brick[] = [
      {
        id: 'brick-1',
        position: vec2(30, 30),
        width: 60,
        height: 24,
        durability: 1,
        isDestroyed: true,
      },
      {
        id: 'brick-2',
        position: vec2(35, 35),
        width: 60,
        height: 24,
        durability: 1,
        isDestroyed: false,
      },
    ];
    const result = checkAllBrickCollisions(ball, bricks, 1 / 60);
    expect(result.collided).toBe(true);
    expect(result.brickId).toBe('brick-2');
  });

  it('returns no collision when no bricks hit', () => {
    const ball: Ball = {
      position: vec2(500, 500),
      velocity: vec2(0, 0),
      radius: 5,
      speed: 100,
    };
    const bricks: Brick[] = [
      {
        id: 'brick-1',
        position: vec2(30, 30),
        width: 60,
        height: 24,
        durability: 1,
        isDestroyed: false,
      },
    ];
    const result = checkAllBrickCollisions(ball, bricks, 1 / 60);
    expect(result.collided).toBe(false);
  });
});
