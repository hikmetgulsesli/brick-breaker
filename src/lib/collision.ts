/**
 * Collision Detection System for Brick Breaker
 * 
 * Implements:
 * - AABB (Axis-Aligned Bounding Box) collision detection
 * - Circle-Rectangle collision for precise ball-brick detection
 * - Sub-frame collision detection to prevent tunneling
 * - Proper collision response with velocity reflection
 */

import type {
  Vector2,
  AABB,
  Circle,
  Ball,
  Paddle,
  Brick,
  GameBounds,
  CollisionResult,
  BrickCollisionResult,
  PaddleCollisionResult,
  WallType,
} from '../entities/types';

/**
 * Creates a vector
 */
export function vec2(x: number, y: number): Vector2 {
  return { x, y };
}

/**
 * Adds two vectors
 */
export function add(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

/**
 * Subtracts two vectors
 */
export function subtract(a: Vector2, b: Vector2): Vector2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

/**
 * Multiplies vector by scalar
 */
export function multiply(v: Vector2, scalar: number): Vector2 {
  return { x: v.x * scalar, y: v.y * scalar };
}

/**
 * Calculates vector magnitude
 */
export function magnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Normalizes a vector
 */
export function normalize(v: Vector2): Vector2 {
  const mag = magnitude(v);
  if (mag === 0) return { x: 0, y: 0 };
  return { x: v.x / mag, y: v.y / mag };
}

/**
 * Calculates dot product of two vectors
 */
export function dot(a: Vector2, b: Vector2): number {
  return a.x * b.x + a.y * b.y;
}

/**
 * Gets AABB from a brick
 */
export function getBrickAABB(brick: Brick): AABB {
  return {
    x: brick.position.x,
    y: brick.position.y,
    width: brick.width,
    height: brick.height,
  };
}

/**
 * Gets AABB from a paddle
 */
export function getPaddleAABB(paddle: Paddle): AABB {
  return {
    x: paddle.position.x,
    y: paddle.position.y,
    width: paddle.width,
    height: paddle.height,
  };
}

/**
 * AABB collision detection between two rectangles
 * Efficient check for axis-aligned bounding boxes
 */
export function checkAABBCollision(a: AABB, b: AABB): CollisionResult {
  const overlapX = Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x);
  const overlapY = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);

  if (overlapX <= 0 || overlapY <= 0) {
    return { collided: false };
  }

  // Determine collision normal based on smaller overlap
  let normal: Vector2;
  let penetration: number;

  if (overlapX < overlapY) {
    // Horizontal collision
    normal = a.x < b.x ? { x: -1, y: 0 } : { x: 1, y: 0 };
    penetration = overlapX;
  } else {
    // Vertical collision
    normal = a.y < b.y ? { x: 0, y: -1 } : { x: 0, y: 1 };
    penetration = overlapY;
  }

  // Calculate contact point
  const contactPoint: Vector2 = {
    x: Math.max(a.x, b.x) + overlapX / 2,
    y: Math.max(a.y, b.y) + overlapY / 2,
  };

  return {
    collided: true,
    normal,
    penetration,
    contactPoint,
  };
}

/**
 * Circle-Rectangle collision detection
 * Precise collision between a circle (ball) and rectangle (brick/paddle)
 */
export function checkCircleRectCollision(circle: Circle, rect: AABB): CollisionResult {
  // Find the closest point on the rectangle to the circle center
  const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));

  // Calculate distance from circle center to closest point
  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distanceSquared = dx * dx + dy * dy;

  // Check if distance is less than circle radius
  if (distanceSquared > circle.radius * circle.radius) {
    return { collided: false };
  }

  const distance = Math.sqrt(distanceSquared);

  // If circle center is inside rectangle, find the closest edge
  if (distance === 0) {
    // Circle center is inside the rectangle
    // Find distances to each edge
    const distToLeft = circle.x - rect.x;
    const distToRight = rect.x + rect.width - circle.x;
    const distToTop = circle.y - rect.y;
    const distToBottom = rect.y + rect.height - circle.y;

    const minDist = Math.min(distToLeft, distToRight, distToTop, distToBottom);

    let normal: Vector2;
    if (minDist === distToLeft) {
      normal = { x: -1, y: 0 };
    } else if (minDist === distToRight) {
      normal = { x: 1, y: 0 };
    } else if (minDist === distToTop) {
      normal = { x: 0, y: -1 };
    } else {
      normal = { x: 0, y: 1 };
    }

    return {
      collided: true,
      normal,
      penetration: minDist + circle.radius,
      contactPoint: { x: closestX, y: closestY },
    };
  }

  // Normal vector points from rectangle to circle
  const normal: Vector2 = {
    x: dx / distance,
    y: dy / distance,
  };

  const penetration = circle.radius - distance;

  return {
    collided: true,
    normal,
    penetration,
    contactPoint: { x: closestX, y: closestY },
  };
}

/**
 * Ball-Brick collision detection using Circle-Rectangle
 */
export function checkBallBrickCollision(ball: Ball, brick: Brick): BrickCollisionResult {
  if (brick.isDestroyed) {
    return { collided: false };
  }

  const brickAABB = getBrickAABB(brick);
  const circle: Circle = {
    x: ball.position.x,
    y: ball.position.y,
    radius: ball.radius,
  };

  const result = checkCircleRectCollision(circle, brickAABB);

  return {
    ...result,
    brickId: result.collided ? brick.id : undefined,
  };
}

/**
 * Ball-Paddle collision detection with hit position calculation
 */
export function checkBallPaddleCollision(ball: Ball, paddle: Paddle): PaddleCollisionResult {
  const paddleAABB = getPaddleAABB(paddle);
  const circle: Circle = {
    x: ball.position.x,
    y: ball.position.y,
    radius: ball.radius,
  };

  const result = checkCircleRectCollision(circle, paddleAABB);

  if (!result.collided) {
    return { collided: false };
  }

  // Calculate hit position on paddle (-1 = left edge, 0 = center, 1 = right edge)
  const paddleCenterX = paddle.position.x + paddle.width / 2;
  const hitPosition = (ball.position.x - paddleCenterX) / (paddle.width / 2);
  const clampedHitPosition = Math.max(-1, Math.min(1, hitPosition));

  return {
    ...result,
    hitPosition: clampedHitPosition,
  };
}

/**
 * Ball-Wall collision detection
 */
export function checkBallWallCollision(
  ball: Ball,
  bounds: GameBounds
): CollisionResult & { wall?: WallType } {
  const left = ball.position.x - ball.radius;
  const right = ball.position.x + ball.radius;
  const top = ball.position.y - ball.radius;
  const bottom = ball.position.y + ball.radius;

  // Check each wall
  if (left < 0) {
    return {
      collided: true,
      normal: { x: 1, y: 0 },
      penetration: -left,
      contactPoint: { x: 0, y: ball.position.y },
      wall: 'left',
    };
  }

  if (right > bounds.width) {
    return {
      collided: true,
      normal: { x: -1, y: 0 },
      penetration: right - bounds.width,
      contactPoint: { x: bounds.width, y: ball.position.y },
      wall: 'right',
    };
  }

  if (top < 0) {
    return {
      collided: true,
      normal: { x: 0, y: 1 },
      penetration: -top,
      contactPoint: { x: ball.position.x, y: 0 },
      wall: 'top',
    };
  }

  if (bottom > bounds.height) {
    return {
      collided: true,
      normal: { x: 0, y: -1 },
      penetration: bottom - bounds.height,
      contactPoint: { x: ball.position.x, y: bounds.height },
      wall: 'bottom',
    };
  }

  return { collided: false };
}

/**
 * Sub-frame collision detection using ray casting
 * Prevents ball tunneling through objects at high speeds
 * 
 * @param ballStart - Ball position at start of frame
 * @param ballEnd - Ball position at end of frame
 * @param radius - Ball radius
 * @param rect - Rectangle to check collision against
 * @returns Collision result with time of impact (0-1)
 */
export function checkSubFrameCollision(
  ballStart: Vector2,
  ballEnd: Vector2,
  radius: number,
  rect: AABB
): CollisionResult & { timeOfImpact?: number } {
  // Expand rectangle by ball radius (Minkowski sum)
  const expandedRect: AABB = {
    x: rect.x - radius,
    y: rect.y - radius,
    width: rect.width + radius * 2,
    height: rect.height + radius * 2,
  };

  // Ray from ball start to end
  const rayDelta = subtract(ballEnd, ballStart);

  // Check if already overlapping
  if (
    ballStart.x >= expandedRect.x &&
    ballStart.x <= expandedRect.x + expandedRect.width &&
    ballStart.y >= expandedRect.y &&
    ballStart.y <= expandedRect.y + expandedRect.height
  ) {
    return {
      collided: true,
      timeOfImpact: 0,
      normal: { x: 0, y: -1 }, // Default normal
      contactPoint: ballStart,
    };
  }

  // Liang-Barsky algorithm for ray-rectangle intersection
  const p = [-rayDelta.x, rayDelta.x, -rayDelta.y, rayDelta.y];
  const q = [
    ballStart.x - expandedRect.x,
    expandedRect.x + expandedRect.width - ballStart.x,
    ballStart.y - expandedRect.y,
    expandedRect.y + expandedRect.height - ballStart.y,
  ];

  let tMin = 0;
  let tMax = 1;

  for (let i = 0; i < 4; i++) {
    if (p[i] === 0) {
      if (q[i] < 0) {
        return { collided: false };
      }
    } else {
      const t = q[i] / p[i];
      if (p[i] < 0) {
        tMin = Math.max(tMin, t);
      } else {
        tMax = Math.min(tMax, t);
      }
    }
  }

  if (tMin > tMax) {
    return { collided: false };
  }

  // Collision detected
  const timeOfImpact = tMin;
  const contactPoint = add(ballStart, multiply(rayDelta, timeOfImpact));

  // Determine normal based on which face was hit
  let normal: Vector2;
  const epsilon = 0.001;

  if (Math.abs(contactPoint.x - expandedRect.x) < epsilon) {
    normal = { x: -1, y: 0 };
  } else if (Math.abs(contactPoint.x - (expandedRect.x + expandedRect.width)) < epsilon) {
    normal = { x: 1, y: 0 };
  } else if (Math.abs(contactPoint.y - expandedRect.y) < epsilon) {
    normal = { x: 0, y: -1 };
  } else {
    normal = { x: 0, y: 1 };
  }

  return {
    collided: true,
    timeOfImpact,
    normal,
    contactPoint,
  };
}

/**
 * Reflects velocity vector around a normal vector
 * Used for collision response
 */
export function reflectVelocity(velocity: Vector2, normal: Vector2): Vector2 {
  const dotProduct = dot(velocity, normal);
  return {
    x: velocity.x - 2 * dotProduct * normal.x,
    y: velocity.y - 2 * dotProduct * normal.y,
  };
}

/**
 * Resolves ball collision by updating position and velocity
 * Handles penetration correction and velocity reflection
 */
export function resolveBallCollision(
  ball: Ball,
  collision: CollisionResult
): Ball {
  if (!collision.collided || !collision.normal || !collision.penetration) {
    return ball;
  }

  // Correct position to prevent sinking
  const correction = multiply(collision.normal, collision.penetration);
  const newPosition = subtract(ball.position, correction);

  // Reflect velocity
  const newVelocity = reflectVelocity(ball.velocity, collision.normal);

  return {
    ...ball,
    position: newPosition,
    velocity: newVelocity,
  };
}

/**
 * Calculates ball velocity after paddle hit based on hit position
 * Angle varies from -60° (left edge) to +60° (right edge)
 */
export function calculatePaddleBounceVelocity(
  ballSpeed: number,
  hitPosition: number
): Vector2 {
  // Clamp hit position to [-1, 1]
  const clampedHit = Math.max(-1, Math.min(1, hitPosition));

  // Calculate angle: -60° to +60°
  const maxAngle = Math.PI / 3; // 60 degrees
  const angle = clampedHit * maxAngle;

  return {
    x: ballSpeed * Math.sin(angle),
    y: -ballSpeed * Math.cos(angle), // Always bounce upward
  };
}

/**
 * Checks all brick collisions and returns the first one detected
 * Uses sub-frame collision for high-speed balls
 */
export function checkAllBrickCollisions(
  ball: Ball,
  bricks: Brick[],
  deltaTime: number
): BrickCollisionResult {
  let earliestCollision: BrickCollisionResult = { collided: false };
  let earliestTime = 1;

  for (const brick of bricks) {
    if (brick.isDestroyed) continue;

    const brickAABB = getBrickAABB(brick);

    // Calculate where ball will be at end of frame
    const ballEnd = add(ball.position, multiply(ball.velocity, deltaTime));

    // Use sub-frame collision for high speeds
    const speed = magnitude(ball.velocity);
    const useSubFrame = speed * deltaTime > ball.radius;

    let result: CollisionResult;

    if (useSubFrame) {
      const subFrame = checkSubFrameCollision(
        ball.position,
        ballEnd,
        ball.radius,
        brickAABB
      );
      result = subFrame;

      // Check if this collision is earlier than current earliest
      if (subFrame.collided && subFrame.timeOfImpact !== undefined && subFrame.timeOfImpact < earliestTime) {
        earliestTime = subFrame.timeOfImpact;
        earliestCollision = {
          collided: true,
          normal: subFrame.normal,
          contactPoint: subFrame.contactPoint,
          brickId: brick.id,
        };
      }
    } else {
      // Use regular circle-rect collision
      const circle: Circle = {
        x: ball.position.x,
        y: ball.position.y,
        radius: ball.radius,
      };
      result = checkCircleRectCollision(circle, brickAABB);

      if (result.collided) {
        return {
          ...result,
          brickId: brick.id,
        };
      }
    }
  }

  return earliestCollision;
}
