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
