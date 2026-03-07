/**
 * Core game entity types for Brick Breaker
 */

/** 2D Vector representation */
export interface Vector2 {
  x: number;
  y: number;
}

/** Axis-Aligned Bounding Box */
export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Circle representation for ball collision */
export interface Circle {
  x: number;
  y: number;
  radius: number;
}

/** Ball entity */
export interface Ball {
  position: Vector2;
  velocity: Vector2;
  radius: number;
  speed: number;
}

/** Paddle entity */
export interface Paddle {
  position: Vector2;
  width: number;
  height: number;
}

/** Brick durability levels */
export type BrickDurability = 1 | 2 | 3;

/** Brick entity */
export interface Brick {
  id: string;
  position: Vector2;
  width: number;
  height: number;
  durability: BrickDurability;
  isDestroyed: boolean;
}

/** Wall types for boundary collision */
export type WallType = 'left' | 'right' | 'top' | 'bottom';

/** Game boundaries */
export interface GameBounds {
  width: number;
  height: number;
}

/** Collision result */
export interface CollisionResult {
  collided: boolean;
  normal?: Vector2;      // Surface normal of collision
  penetration?: number;  // Penetration depth
  contactPoint?: Vector2;
}

/** Brick collision result with additional info */
export interface BrickCollisionResult extends CollisionResult {
  brickId?: string;
}

/** Paddle collision result with angle info */
export interface PaddleCollisionResult extends CollisionResult {
  hitPosition?: number;  // -1 (left edge) to 1 (right edge)
}
